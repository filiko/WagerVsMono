import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase";
import { recordPredictionTo0G } from "../services/zeroG";
import fs from "fs";
import path from "path";

const router = Router();

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
    const { data: log, error } = await supabaseAdmin
      .from('ai_prediction_logs')
      .insert({
        wager_id: wagerId,
        title,
        confidence_pct: typeof confidencePct === "number" ? confidencePct : null,
        model_provider: model.provider,
        model_name: model.name,
        model_version: model.version ?? null,
        created_utc: new Date(createdUtc).toISOString(),
        server_received_utc: new Date(artifact.timestamps.server_received_utc).toISOString(),
        app_env: artifact.app.env,
        cid0g: cid,
        integrity_sha256: sha256,
      })
      .select()
      .single();

    if (error) throw error;

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
    const { data: log, error } = await supabaseAdmin
      .from('ai_prediction_logs')
      .select(`
        id,
        wager_id,
        title,
        confidence_pct,
        model_provider,
        model_name,
        model_version,
        created_utc,
        server_received_utc,
        app_env,
        cid0g,
        integrity_sha256,
        created_at
      `)
      .eq('wager_id', wagerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!log) return res.status(404).json({ error: "Not found" });
    
    return res.json({ 
      log: {
        id: log.id,
        wagerId: log.wager_id,
        title: log.title,
        confidencePct: log.confidence_pct,
        modelProvider: log.model_provider,
        modelName: log.model_name,
        modelVersion: log.model_version,
        createdUtc: log.created_utc,
        serverReceivedUtc: log.server_received_utc,
        appEnv: log.app_env,
        cid0g: log.cid0g,
        integritySha256: log.integrity_sha256,
        createdAt: log.created_at,
      }
    });
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
    
    const { data: log, error } = await supabaseAdmin
      .from('ai_prediction_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!log) return res.status(404).json({ error: "Not found" });
    
    return res.json({ 
      log: {
        id: log.id,
        wagerId: log.wager_id,
        title: log.title,
        confidencePct: log.confidence_pct,
        modelProvider: log.model_provider,
        modelName: log.model_name,
        modelVersion: log.model_version,
        createdUtc: log.created_utc,
        serverReceivedUtc: log.server_received_utc,
        appEnv: log.app_env,
        cid0g: log.cid0g,
        integritySha256: log.integrity_sha256,
        createdAt: log.created_at,
      }
    });
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
    
    const { data: log, error } = await supabaseAdmin
      .from('ai_prediction_logs')
      .select('wager_id')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!log) return res.status(404).json({ error: "Not found" });

    // Dev fallback: read from .artifacts/<wagerId>.json
    const file = path.resolve(process.cwd(), ".artifacts", `${log.wager_id}.json`);
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
