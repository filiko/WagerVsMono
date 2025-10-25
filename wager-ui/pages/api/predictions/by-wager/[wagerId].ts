import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { wagerId } = req.query; // Get from req.query
    const { data: log, error } = await supabaseAdmin
      .from("ai_prediction_logs")
      .select(
        `
        id, wager_id, title, confidence_pct, model_provider, model_name,
        model_version, created_utc, server_received_utc, app_env, cid0g,
        integrity_sha256, created_at
      `
      )
      .eq("wager_id", wagerId as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!log) return res.status(404).json({ error: "Not found" });

    // Original code wrapped this in a { log: ... } object
    return res.json({ log });
  } catch (err) {
    console.error("/predictions/by-wager error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
