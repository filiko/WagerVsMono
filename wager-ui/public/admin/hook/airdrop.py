import os
import csv
from dotenv import load_dotenv

from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction
from solders.message import MessageV0

from solana.rpc.api import Client
from solana.rpc.types import TxOpts
from solana.rpc.commitment import Confirmed

from spl.token.instructions import (
    get_associated_token_address,
    transfer_checked,
    create_associated_token_account,
)
from spl.token.constants import TOKEN_PROGRAM_ID

# Load environment variables
load_dotenv()

# SOLANA_RPC_URL = "https://api.devnet.solana.com"
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"

client = Client(SOLANA_RPC_URL)


# Load wallet from either hex or base58
def load_wallet(secret: str) -> Keypair:
    try:
        # Try hex
        return Keypair.from_bytes(bytes.fromhex(secret))
    except ValueError:
        # Fallback to base58
        return Keypair.from_base58_string(secret)


# Get token decimals from RPC
def get_token_decimals(mint: str) -> int:
    try:
        resp = client.get_token_supply(Pubkey.from_string(mint))

        return resp['result']['value']['decimals']
    except Exception as e:
        print(f"❌ Could not fetch token decimals for mint {mint}: {e}")
        return 9  # fallback


def send_token(wallet_address: str, amount: float, token_mint: str, private_key: str):
    try:
        sender = load_wallet(private_key)
        sender_pubkey = sender.pubkey()

        recipient_pubkey = Pubkey.from_string(wallet_address)
        mint_pubkey = Pubkey.from_string(token_mint)

        sender_ata = get_associated_token_address(sender_pubkey, mint_pubkey)
        recipient_ata = get_associated_token_address(recipient_pubkey, mint_pubkey)

        decimals = get_token_decimals(token_mint)
        amount_to_send = int(amount * (10 ** decimals))

        # Instructions
        instructions = []

        # Check if recipient ATA exists
        ata_info = client.get_account_info(recipient_ata, commitment=Confirmed)
        if ata_info.value is None:
            create_ix = create_associated_token_account(
                payer=sender_pubkey,
                owner=recipient_pubkey,
                mint=mint_pubkey
            )
            instructions.append(create_ix)

        transfer_ix = transfer_checked(
            source=sender_ata,
            destination=recipient_ata,
            owner=sender_pubkey,
            amount=amount_to_send,
            decimals=decimals,
            token_mint=mint_pubkey,
            program_id=TOKEN_PROGRAM_ID,
        )
        instructions.append(transfer_ix)

        blockhash = client.get_latest_blockhash()['result']['value']['blockhash']
        msg = MessageV0.try_compile(
            payer=sender_pubkey,
            instructions=instructions,
            recent_blockhash=blockhash,
            address_lookup_tables=[],
        )
        tx = VersionedTransaction(msg, [sender])

        send_resp = client.send_raw_transaction(tx.serialize(), opts=TxOpts(skip_preflight=True))
        print(f"✅ Sent {amount} to {wallet_address} | Tx: {send_resp['result']}")
    except Exception as e:
        print(f"❌ Error sending to {wallet_address}: {e}")


def process_csv(file_path: str):
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        raise ValueError("PRIVATE_KEY is missing in your .env file")

    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                token_mint = row["Token Mint Address"].strip()
                wallet_address = row["Wallet Address"].strip()
                amount = float(row["Amount"].strip())
                send_token(wallet_address, amount, token_mint, private_key)
            except Exception as e:
                print(f"❌ Failed to process row {row}: {e}")


if __name__ == "__main__":
    csv_path = "/var/www/vs/admin/airdrop_data.csv"
    process_csv(csv_path)

