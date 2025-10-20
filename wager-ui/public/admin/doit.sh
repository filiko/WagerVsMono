export SPL_TOKEN="7SGrxHJFwNcsjkeu5WqZZKpB1b8LayWZLtrEEtBYhLjW"
export RECIEPIENT="CdUoxBvw5VA2U4JbxXT4QKA9z9uD1UdNNJKPdJx4tfuZ"
export AMOUNT=18666001
export PKEY="X1IWALfc06HAPcBSNfxA2BEbe++7xfktIO9V1e3DYyrMD+u9QwI1F9EgcnM7b+SOA4x3JT0hIT3YEPHpwedRVQ=="

node decodeKey.js

spl-token transfer \
  $SPL_TOKEN \
  $AMOUNT \
  $RECIEPIENT \
  --owner /tmp/tmp_keypair.json \
  --fee-payer /tmp/tmp_keypair.json \
  --url https://mainnet.helius-rpc.com/?api-key=89cddc0a-3910-41b9-8b79-806f94eceb12

