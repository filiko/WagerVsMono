#!/usr/bin/env node
// Verify a local 0G artifact's integrity hash.
// Usage:
//   node scripts/verifyArtifact.js .artifacts/<wagerId>.json
//   node scripts/verifyArtifact.js <wagerId>   # looks under ./.artifacts/<wagerId>.json

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function usage() {
  console.error('Usage: node scripts/verifyArtifact.js <artifactPath | wagerId>');
  process.exit(1);
}

function sha256(bufOrStr) {
  return crypto.createHash('sha256').update(bufOrStr).digest('hex');
}

async function main() {
  const arg = process.argv[2];
  if (!arg) usage();

  let file = arg;
  if (!fs.existsSync(file)) {
    file = path.resolve(process.cwd(), '.artifacts', `${arg}.json`);
  }
  if (!fs.existsSync(file)) {
    console.error(`Artifact not found: ${arg}`);
    console.error(`Checked: ${arg} and ${path.resolve(process.cwd(), '.artifacts', `${arg}.json`)}`);
    process.exit(2);
  }

  const raw = fs.readFileSync(file, 'utf8');
  let artifact;
  try {
    artifact = JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse JSON: ${file}`);
    process.exit(3);
  }

  const embedded = artifact?.integrity?.sha256;
  if (!embedded) {
    console.error('Artifact missing integrity.sha256');
    process.exit(4);
  }

  // Compute sha256 over all fields except the top-level integrity field
  const bodyStr = JSON.stringify(artifact, (key, val) => (key === 'integrity' ? undefined : val));
  const computed = sha256(bodyStr);

  // Also compute a dev pseudo-CID (how the stub derives it)
  const artifactBytes = Buffer.from(JSON.stringify(artifact));
  const artifactSha = sha256(artifactBytes);
  const pseudoCid = `z${artifactSha.slice(0, 46)}`;

  const ok = embedded === computed;
  console.log(`File: ${file}`);
  console.log(`Embedded integrity.sha256: ${embedded}`);
  console.log(`Recomputed (no-integrity)  : ${computed}`);
  console.log(`Dev pseudo CID (bytes)     : ${pseudoCid}`);
  console.log(ok ? 'VERIFIED: hash matches integrity.sha256' : 'FAILED: hash mismatch');
  process.exit(ok ? 0 : 5);
}

main().catch((e) => {
  console.error(e);
  process.exit(99);
});

