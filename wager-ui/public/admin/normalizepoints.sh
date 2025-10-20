#!/bin/bash

# Load .env
set -o allexport
source .env
set +o allexport

DB_NAME_CLEANED=$(echo "$DB_NAME" | tr -d '\r\n ')

# Config
CSV_FILE="normalize.csv"
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
tail -n +2 "$CSV_FILE" | while IFS=',' read -r WALLET_ADDRESS AMOUNT; do
  echo "🔄 Preparing to send $AMOUNT to $WALLET_ADDRESS..."

  # Print the values for verification
  echo "WALLET_ADDRESS: $WALLET_ADDRESS, AMOUNT: $AMOUNT"

  # Skip the actual insert for now
   mysql "$DB_NAME_CLEANED" <<EOF
   INSERT INTO points_history (
     wallet_id,
     event_type,
     points,
     timestamp,
     description,
     related_transaction_id,
     referrer_wallet_id
   ) VALUES (
     '$WALLET_ADDRESS',
     'normalized',
     $AMOUNT,
     NOW(),
     'Added this $AMOUNT to $WALLET_ADDRESS to normalize points',
     '$SIGNATURE',
     NULL
   );
EOF

  echo "----------------------------"
done
