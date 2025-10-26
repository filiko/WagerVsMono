import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const id = Number(req.query.id); // Get from req.query
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid id" });

    const { data: log, error } = await supabaseAdmin
      .from("ai_prediction_logs")
      .select("wager_id")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!log) return res.status(404).json({ error: "Not found" });

    // Dev fallback: read from .artifacts/<wagerId>.json (copied from original)
    const file = path.resolve(
      process.cwd(),
      ".artifacts",
      `${log.wager_id}.json`
    );
    if (fs.existsSync(file)) {
      const buf = fs.readFileSync(file);
      res.setHeader("content-type", "application/json");
      return res.send(buf);
    }

    return res.status(404).json({ error: "Artifact not available locally." });
  } catch (err) {
    console.error("/predictions/:id/artifact error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
