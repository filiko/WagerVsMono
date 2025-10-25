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
    const id = Number(req.query.id); // Get from req.query
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid id" });

    const { data: log, error } = await supabaseAdmin
      .from("ai_prediction_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!log) return res.status(404).json({ error: "Not found" });

    // Original code wrapped this in a { log: ... } object
    return res.json({ log });
  } catch (err) {
    console.error("/predictions/:id error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
