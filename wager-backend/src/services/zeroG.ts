import { createHash } from "crypto";
import fs from "fs";
import path from "path";

export type PredictionInput = {
  wagerId: string;
  title: string;
  confidencePct?: number;
  model: { provider: string; name: string; version?: string };
  createdUtc: string; // ISO string
  appEnv?: string;
  // Optional: allow passing an explicit left/right mapping
  wagerSideMapping?: { left: string; right: string };
};

export type ZeroGRecordResult = {
  cid: string;
  sha256: string;
  artifact: any;
};

/**
 * Build a canonical JSON artifact for an AI prediction.
 */
export function buildPredictionArtifact(input: PredictionInput) {
  const base = {
    wager_id: input.wagerId,
    prediction: {
      title: input.title,
      confidence_pct: input.confidencePct,
    },
    model: input.model,
    timestamps: {
      created_utc: input.createdUtc,
      server_received_utc: new Date().toISOString(),
    },
    app: {
      env: input.appEnv ?? process.env.APP_ENV ?? "prod",
      wager_side_mapping: input.wagerSideMapping ?? { left: "no", right: "yes" },
    },
  };

  const body = JSON.stringify(base);
  const sha256 = createHash("sha256").update(body).digest("hex");
  const artifact = { ...base, integrity: { sha256 } };

  return { artifact, sha256 };
}

/**
 * Upload bytes to 0G. If the SDK/env is not configured, returns a
 * deterministic CID-like value (based on sha256) and optionally writes
 * the artifact to disk under .artifacts for local dev.
 */
export async function uploadToZeroG(bytes: Buffer, opts?: { filename?: string }) {
  const endpoint = process.env.ZEROG_ENDPOINT;
  const apiKey = process.env.ZEROG_KEY;

  // TODO: Replace this stub with the real SDK when available.
  // Example:
  // const { ZeroGClient } = await import("@0glabs/0g-ts-sdk");
  // const client = new ZeroGClient({ endpoint, apiKey });
  // const { cid } = await client.upload(bytes, { contentType: "application/json", filename: opts?.filename });
  // return { cid };

  // Dev fallback: compute a pseudo CID from sha256
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const cid = `z${sha256.slice(0, 46)}`; // pseudo content-addressed id

  // Optionally persist locally for inspection
  try {
    const outDir = path.resolve(process.cwd(), ".artifacts");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const fname = opts?.filename ?? `${cid}.json`;
    fs.writeFileSync(path.join(outDir, fname), bytes);
  } catch {
    // best-effort only
  }

  return { cid };
}

/**
 * Build the artifact, upload to 0G, and return identifiers.
 */
export async function recordPredictionTo0G(input: PredictionInput): Promise<ZeroGRecordResult> {
  const { artifact, sha256 } = buildPredictionArtifact(input);
  const bytes = Buffer.from(JSON.stringify(artifact));
  const { cid } = await uploadToZeroG(bytes, { filename: `${input.wagerId}.json` });
  return { cid, sha256, artifact };
}

