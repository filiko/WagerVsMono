"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPredictionArtifact = buildPredictionArtifact;
exports.uploadToZeroG = uploadToZeroG;
exports.recordPredictionTo0G = recordPredictionTo0G;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Build a canonical JSON artifact for an AI prediction.
 */
function buildPredictionArtifact(input) {
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
    const sha256 = (0, crypto_1.createHash)("sha256").update(body).digest("hex");
    const artifact = { ...base, integrity: { sha256 } };
    return { artifact, sha256 };
}
/**
 * Upload bytes to 0G. If the SDK/env is not configured, returns a
 * deterministic CID-like value (based on sha256) and optionally writes
 * the artifact to disk under .artifacts for local dev.
 */
async function uploadToZeroG(bytes, opts) {
    const endpoint = process.env.ZEROG_ENDPOINT;
    const apiKey = process.env.ZEROG_KEY;
    // TODO: Replace this stub with the real SDK when available.
    // Example:
    // const { ZeroGClient } = await import("@0glabs/0g-ts-sdk");
    // const client = new ZeroGClient({ endpoint, apiKey });
    // const { cid } = await client.upload(bytes, { contentType: "application/json", filename: opts?.filename });
    // return { cid };
    // Dev fallback: compute a pseudo CID from sha256
    const sha256 = (0, crypto_1.createHash)("sha256").update(bytes).digest("hex");
    const cid = `z${sha256.slice(0, 46)}`; // pseudo content-addressed id
    // Optionally persist locally for inspection
    try {
        const outDir = path_1.default.resolve(process.cwd(), ".artifacts");
        if (!fs_1.default.existsSync(outDir))
            fs_1.default.mkdirSync(outDir, { recursive: true });
        const fname = opts?.filename ?? `${cid}.json`;
        fs_1.default.writeFileSync(path_1.default.join(outDir, fname), bytes);
    }
    catch {
        // best-effort only
    }
    return { cid };
}
/**
 * Build the artifact, upload to 0G, and return identifiers.
 */
async function recordPredictionTo0G(input) {
    const { artifact, sha256 } = buildPredictionArtifact(input);
    const bytes = Buffer.from(JSON.stringify(artifact));
    const { cid } = await uploadToZeroG(bytes, { filename: `${input.wagerId}.json` });
    return { cid, sha256, artifact };
}
//# sourceMappingURL=zeroG.js.map