import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { recordPredictionTo0G } from "../services/zeroG";
import fs from "fs";
import path from "path";

const router = Router();
const prisma = new PrismaClient();

// Simple internal guard: require X-Internal-Key header if configured
function requireInternalKey(req: any, res: any, next: any) {
  const expected = process.env.PREDICTION_INTERNAL_KEY;
  if (!expected) return next(); // not set -> allow in dev
  const got = (req.headers["x-internal-key"] || req.query.key || "") as string;
  if (!got || got !== expected) return res.status(401).json({ error: "Unauthorized" });
  next();
}

/**
 * POST /api/predictions/record
 * Body: {
 *   wagerId: string,
 *   title: string,
 *   confidencePct?: number,
 *   model: { provider: string; name: string; version?: string },
 *   createdUtc: string (ISO),
 * }
 *
 * Response: { id, cid, sha256 }
 */
router.post("/record", requireInternalKey, async (req, res) => {
  try {
    const { wagerId, title, confidencePct, model, createdUtc } = req.body || {};

    if (!wagerId || !title || !model?.provider || !model?.name || !createdUtc) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1) Upload canonical artifact to 0G (or stub)
    const { cid, sha256, artifact } = await recordPredictionTo0G({
      wagerId,
      title,
      confidencePct,
      model,
      createdUtc,
    });

    // 2) Persist pointer in DB
    const log = await (prisma as any).aiPredictionLog.create({
      data: {
        wagerId,
        title,
        confidencePct: typeof confidencePct === "number" ? confidencePct : null,
        modelProvider: model.provider,
        modelName: model.name,
        modelVersion: model.version ?? null,
        createdUtc: new Date(createdUtc),
        serverReceivedUtc: new Date(artifact.timestamps.server_received_utc),
        appEnv: artifact.app.env,
        cid0g: cid,
        integritySha256: sha256,
      },
    });

    return res.json({ id: log.id, cid, sha256 });
  } catch (err) {
    console.error("/predictions/record error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/predictions/by-wager/:wagerId -> latest log for a wager
router.get("/by-wager/:wagerId", async (req, res) => {
  try {
    const { wagerId } = req.params;
    const log = await (prisma as any).aiPredictionLog.findFirst({
      where: { wagerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        wagerId: true,
        title: true,
        confidencePct: true,
        modelProvider: true,
        modelName: true,
        modelVersion: true,
        createdUtc: true,
        serverReceivedUtc: true,
        appEnv: true,
        cid0g: true,
        integritySha256: true,
        createdAt: true,
      },
    });
    if (!log) return res.status(404).json({ error: "Not found" });
    return res.json({ log });
  } catch (err) {
    console.error("/predictions/by-wager error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/predictions/:id -> log by id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const log = await (prisma as any).aiPredictionLog.findUnique({ where: { id } });
    if (!log) return res.status(404).json({ error: "Not found" });
    return res.json({ log });
  } catch (err) {
    console.error("/predictions/:id error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/predictions/:id/artifact -> dev-helper: return local artifact JSON if present
router.get("/:id/artifact", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const log = await (prisma as any).aiPredictionLog.findUnique({ where: { id } });
    if (!log) return res.status(404).json({ error: "Not found" });

    // Dev fallback: read from .artifacts/<wagerId>.json
    const file = path.resolve(process.cwd(), ".artifacts", `${log.wagerId}.json`);
    if (fs.existsSync(file)) {
      const buf = fs.readFileSync(file);
      res.setHeader("content-type", "application/json");
      return res.send(buf);
    }

    return res.status(404).json({ error: "Artifact not available locally. Use 0G CID to fetch from remote." });
  } catch (err) {
    console.error("/predictions/:id/artifact error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
