#!/bin/bash

# Load .env
set -o allexport
source .env
set +o allexport

DB_NAME_CLEANED=$(echo "$DB_NAME" | tr -d '\r\n ')


# Config
CSV_FILE="data.csv"
KEYPAIR_PATH="/root/.config/solana/tinywallet.json"
RPC_URL="https://api.mainnet-beta.solana.com"

# Debug info
echo "📦 Using DB connection from ~/.my.cnf"
echo "📡 Using RPC: $RPC_URL"
echo "🔐 Using Keypair: $KEYPAIR_PATH"
echo "📄 Reading CSV: $CSV_FILE"
echo "🗃  Logging to database: $DB_NAME"
echo "----------------------------"

# Skip header and process each row
tail -n +2 "$CSV_FILE" | while IFS=',' read -r TOKEN_MINT WALLET_ADDRESS AMOUNT; do
  echo "🔄 Sending $AMOUNT of $TOKEN_MINT to $WALLET_ADDRESS..."

  TX_OUTPUT=$(spl-token transfer "$TOKEN_MINT" "$AMOUNT" "$WALLET_ADDRESS" \
    --fund-recipient \
    --owner "$KEYPAIR_PATH" \
    --url "$RPC_URL" 2>&1)

  if echo "$TX_OUTPUT" | grep -q "Signature:"; then
    SIGNATURE=$(echo "$TX_OUTPUT" | grep "Signature:" | awk '{print $2}')
    echo "✅ Success! Tx: $SIGNATURE"

    # Log to MySQL using ~/.my.cnf
    mysql "$DB_NAME_CLEANED" <<EOF
INSERT INTO airdrop_transactions (wallet_id, amount, transaction_hash)
VALUES ('$WALLET_ADDRESS', $AMOUNT, '$SIGNATURE');
EOF

    echo "🛢  Logged transaction to MySQL."
  else
    echo "❌ Failed to send to $WALLET_ADDRESS"
    echo "$TX_OUTPUT"
  fi

  echo "----------------------------"
done

