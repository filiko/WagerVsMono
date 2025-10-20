import os
import json
import base64
import subprocess
import sys
import base58
import hashlib
import struct
from solders.pubkey import Pubkey as PublicKey
from solders.assoc_token import get_associated_token_address


from nacl.signing import SigningKey
ASSOCIATED_TOKEN_PROGRAM_ID = PublicKey("ATokenGPvbdGVxr1hVdzZbMyP5nb1f1eVfQg9weZyybP")
TOKEN_PROGRAM_ID = PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

# === Config ===
if len(sys.argv) != 3:
    print("Usage: python refundit.py <RECIPIENT_PUBLIC_KEY> <AMOUNT>")
    sys.exit(1)

RECIPIENT = sys.argv[1]
AMOUNT = sys.argv[2]
ENV_FILE = ".env"
COMPLETED_FILE = ".completed"
RPC_URL = "https://mainnet.helius-rpc.com/?api-key=89cddc0a-3910-41b9-8b79-806f94eceb12"

# === Track completed refunds ===
completed_set = set()
if os.path.exists(COMPLETED_FILE):
    with open(COMPLETED_FILE, "r") as f:
        for line in f:
            completed_set.add(line.strip())

def base64_to_keypair(base64_str):
    key_bytes = base64.b64decode(base64_str)
    if len(key_bytes) == 64:
        return list(key_bytes)
    elif len(key_bytes) == 32:
        signing_key = SigningKey(key_bytes)
        return list(signing_key.encode() + signing_key.verify_key.encode())
    else:
        raise ValueError("Private key must decode to 32 or 64 bytes")

def get_source_token_account(owner, mint):
    try:
        result = subprocess.run([
            "spl-token", "accounts",
            "--owner", owner,
            "--output", "json",
            "--url", RPC_URL
        ], capture_output=True, check=True, text=True)
        accounts = json.loads(result.stdout)["accounts"]
        for acc in accounts:
            if acc["mint"] == mint:
                return acc["address"]
    except Exception as e:
        print(f"❌ Failed to get source token account: {e}")
    return None


# Program ID for the associated token account program

def get_recipient_ata(recipient_pubkey, mint):
    try:
        ata = get_associated_token_address(
            owner=PublicKey.from_string(recipient_pubkey),
            mint=PublicKey.from_string(mint)
        )
        return str(ata)
    except Exception as e:
        print(f"❌ Failed to derive ATA: {e}")
        return None


def send_token(token_mint, public_key, base64_privkey):
    record_key = f"{token_mint},{public_key},{RECIPIENT},{AMOUNT}"
    if record_key in completed_set:
        print(f"⏭️  Already sent: {record_key}")
        return

    try:
        keypair_array = base64_to_keypair(base64_privkey)
    except Exception as e:
        print(f"❌ Invalid key for {public_key}: {e}")
        return

    keypair_path = f"/tmp/{public_key}_keypair.json"
    with open(keypair_path, "w") as f:
        json.dump(keypair_array, f)

    try:
        subprocess.run([
            "solana", "config", "set",
            "--keypair", keypair_path,
            "--url", RPC_URL
        ], check=True)

        source_account = get_source_token_account(public_key, token_mint)
        if not source_account:
            print(f"❌ No source token account found for {token_mint}")
            return

        recipient_token_account = get_recipient_ata(RECIPIENT, token_mint)
        if not recipient_token_account:
            print(f"❌ Could not derive recipient token account")
            return

        result = subprocess.run([
            "spl-token", "transfer",
            source_account, AMOUNT, recipient_token_account,
            "--fund-recipient",
            "--allow-unfunded-recipient",
            "--owner", keypair_path,
            "--fee-payer", keypair_path,
            "--url", RPC_URL
        ], capture_output=True, text=True)

        if result.returncode == 0:
            print(f"✅ Sent {AMOUNT} of {token_mint} from {public_key} to {recipient_token_account}")
            signature = None
            for line in result.stdout.splitlines():
                if "Signature:" in line:
                    signature = line.split("Signature:")[1].strip()
                    break
            if signature:
                with open(COMPLETED_FILE, "a") as log_file:
                    log_file.write(f"{record_key},{signature}\n")
                completed_set.add(record_key)
            else:
                print("⚠️ Transfer succeeded, but no signature found.")
        else:
            print(f"⚠️ Transfer failed for {public_key}")
            print(result.stderr)

    except subprocess.CalledProcessError as e:
        print(f"❌ Subprocess error for {public_key}: {e}")
    finally:
        os.remove(keypair_path)

# === Read .env and process lines ===
with open(ENV_FILE, "r") as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            continue
        try:
            parts = line.strip().split(",")
            if len(parts) != 3:
                raise ValueError("Line must have 3 parts: token, pubkey, privkey")
            token_address, public_key, base64_privkey = parts
            print(f"✅ Parsed: token={token_address}, pubkey={public_key}")
            send_token(token_address, public_key, base64_privkey.strip())
        except ValueError as e:
            print(f"❌ Skipping invalid line: {line.strip()} ({e})")

