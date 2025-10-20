const fs = require("fs");

const base64 = "X1IWALfc06HAPcBSNfxA2BEbe++7xfktIO9V1e3DYyrMD+u9QwI1F9EgcnM7b+SOA4x3JT0hIT3YEPHpwedRVQ==";
const decoded = Buffer.from(base64, "base64");

if (decoded.length !== 64) {
  throw new Error("Invalid private key length");
}

const array = Array.from(decoded);
fs.writeFileSync("/tmp/tmp_keypair.json", JSON.stringify(array));
console.log("✅ Saved keypair to /tmp/tmp_keypair.json");

