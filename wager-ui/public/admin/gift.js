const {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
  ComputeBudgetProgram
} = require("@solana/web3.js");

const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction
} = require("@solana/spl-token");

const bs58 = require("bs58");

// ✅ 1. Connect to Solana Network (Mainnet or Devnet)
const SOLANA_NETWORK = "https://api.mainnet-beta.solana.com"; // Use "https://api.devnet.solana.com" for testing
const connection = new Connection(SOLANA_NETWORK, "finalized");

// ✅ 2. Define Token Mint Address (Replace with your token mint address)
const TOKEN_MINT_ADDRESS = new PublicKey("7SGrxHJFwNcsjkeu5WqZZKpB1b8LayWZLtrEEtBYhLjW");

// ✅ 3. Sender Wallet (Private Key in Base58 Format)
const senderPrivateKey = "2GunWLQCTYvowno86EGJ8EU8o3Sg1y1uRffY53bPu8CV2DVnyxW5bBWK3GLd73RCMKwG2DKhGf7Esr3SV2sF4Zj7";
const senderKeypair = Keypair.fromSecretKey(bs58.decode(senderPrivateKey)); // Decode Private Key
const senderPublicKey = senderKeypair.publicKey;

// ✅ 4. Receiver Wallet Address (Public Key) address of user connected account
const receiverPublicKey = new PublicKey("CH83arCvMogqssrLEQDA2YAvLectz8A7VtH4gkboyHj4");

// ✅ Function to Send SPL Tokens
async function sendSplToken(amount) {
  try {
    console.log("\n🚀 Starting Token Transfer...");

    // ✅ Get Sender & Receiver Token Accounts
    const senderTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, senderPublicKey);
    const receiverTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, receiverPublicKey);

    console.log("✅ Sender Token Account:", senderTokenAccount.toBase58());
    console.log("✅ Receiver Token Account:", receiverTokenAccount.toBase58());

    const transaction = new Transaction();

    // ✅ Check if receiver's token account exists using getAccountInfo()
    const accountInfo = await connection.getAccountInfo(receiverTokenAccount);

    if (!accountInfo) {
      console.log("⚠️ Receiver's Token Account Does Not Exist. Creating Now...");

      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPublicKey, // Fee payer
          receiverTokenAccount, // New associated token account
          receiverPublicKey, // Owner of the account
          TOKEN_MINT_ADDRESS // Token mint address
        )
      );
    }

    // ✅ Add Transfer Instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount, // Sender's Token Account
        receiverTokenAccount, // Receiver's Token Account
        senderPublicKey, // Sender's Public Key
        amount * 10 ** 6 // Convert to smallest unit (e.g., USDC has 6 decimals)
      )
    );

    // ✅ Fetch Latest Blockhash & Set Priority Fees
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 100_000, // Increase priority fee
      })
    );

    // ✅ Sign & Send the Transaction
    console.log("> TRANSFERRING TOKENS...");
    const txSignature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

    console.log(`✅ Transaction Successful! Signature: ${txSignature}`);
    console.log(`🔍 Track Transaction: https://explorer.solana.com/tx/${txSignature}?cluster=mainnet`);
    
  } catch (error) {
    console.error("❌ Transfer Failed:", error.message);
  }
}

// ✅ Call Function to Transfer Tokens (Change Amount as Needed)
sendSplToken(500); // Transfer 500 Tokens
