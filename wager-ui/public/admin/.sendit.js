// Create a temporary script: sendAll.js

import { sendSplToken } from "./sendSplToken.js";

const recipient = "CdUoxBvw5VA2U4JbxXT4QKA9z9uD1UdNNJKPdJx4tfuZ"; // Replace with your target wallet
const amount = 18666001; // Amount to transfer
const privateKey = "X1IWALfc06HAPcBSNfxA2BEbe++7xfktIO9V1e3DYyrMD+u9QwI1F9EgcnM7b+SOA4x3JT0hIT3YEPHpwedRVQ=="; // Base58 / JSON array / Base64 format

sendSplToken(recipient, amount, privateKey)
  .then(tx => console.log("✅ Sent all tokens! TX:", tx))
  .catch(err => console.error("❌ Error sending tokens:", err.message));

