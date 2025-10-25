import { supabaseAdmin } from "@/lib/supabaseClient";
import { recordPredictionTo0G } from "@/lib/zeroG";
import { NextApiRequest, NextApiResponse } from "next";

// Helper for internal key check
const requireInternalKey = (req: NextApiRequest): boolean => {
  const expected = process.env.PREDICTION_INTERNAL_KEY;
  if (!expected) return true; // allow in dev if not set
  const got = (req.headers["x-internal-key"] || req.query.key || "") as string;
  if (!got || got !== expected) return false;
  return true;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  if (!requireInternalKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
      .from("ai_prediction_logs")
      .insert({
        wager_id: wagerId,
        title,
        confidence_pct:
          typeof confidencePct === "number" ? confidencePct : null,
        model_provider: model.provider,
        model_name: model.name,
        model_version: model.version ?? null,
        created_utc: new Date(createdUtc).toISOString(),
        server_received_utc: new Date(
          artifact.timestamps.server_received_utc
        ).toISOString(),
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
}
