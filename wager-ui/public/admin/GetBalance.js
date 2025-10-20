import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

// Address: 9vpsmXhZYMpvhCKiVoX5U8b1iKpfwJaFpPEEXF7hRm9N
const DEMO_WALLET_SECRET_KEY = new Uint8Array([
  37, 21, 197, 185, 105, 201, 212, 148, 164, 108, 251, 159, 174, 252, 43, 246,
  225, 156, 38, 203, 99, 42, 244, 73, 252, 143, 34, 239, 15, 222, 217, 91, 132,
  167, 105, 60, 17, 211, 120, 243, 197, 99, 113, 34, 76, 127, 190, 18, 91, 246,
  121, 93, 189, 55, 165, 129, 196, 104, 25, 157, 209, 168, 165, 149,
]);
(async () => {
  // Connect to cluster
  var connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  // Construct wallet keypairs
  var fromWallet = web3.Keypair.fromSecretKey(DEMO_WALLET_SECRET_KEY);
  var toWallet = web3.Keypair.generate();
  // Construct my token class
  var myMint = new web3.PublicKey("My Mint Public Address");
  var myToken = new splToken.Token(
    connection,
    myMint,
    splToken.TOKEN_PROGRAM_ID,
    fromWallet
  );
  // Create associated token accounts for my token if they don't exist yet
  var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  )
  var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey
  )
  // Add token transfer instructions to transaction
  var transaction = new web3.Transaction()
    .add(
      splToken.Token.createTransferInstruction(
        splToken.TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        [],
        0
      )
    );
  // Sign transaction, broadcast, and confirm
  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet]
  );
  console.log("SIGNATURE", signature);
  console.log("SUCCESS");
})();
