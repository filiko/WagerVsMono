import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import { randomUUID } from "crypto";
import { recordPredictionTo0G } from "@/lib/zeroG";
import { supabaseAdmin } from "@/lib/supabaseClient";

// Helper function to replace 'requireAdmin' middleware
const verifyAdmin = (req: NextApiRequest): { username: string } | null => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    if (!decoded || decoded.role !== "admin") return null;
    return { username: decoded.username };
  } catch (err) {
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { description } = req.body || {};
    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "description is required" });
    }

    // Stub logic (copied from original)
    const title = description.slice(0, 60).trim() || "AI Suggested Wager";
    const confidencePct = Math.round(50 + Math.random() * 40); // 50–90

    // 0G artifact (copied from original)
    const wagerId = `ai-${randomUUID()}`;
    const createdUtc = new Date().toISOString();
    const { cid, sha256 } = await recordPredictionTo0G({
      wagerId,
      title,
      confidencePct,
      model: { provider: "openai", name: "gpt-4x-mini", version: "stub" },
      createdUtc,
    });

    // **THE FIX**: Use Supabase instead of Prisma
    const { data: log, error } = await supabaseAdmin
      .from("ai_prediction_logs")
      .insert({
        wager_id: wagerId,
        title: title,
        confidence_pct: confidencePct,
        model_provider: "openai",
        model_name: "gpt-4x-mini",
        model_version: "stub",
        created_utc: new Date(createdUtc),
        server_received_utc: new Date(),
        app_env: process.env.APP_ENV ?? "prod",
        cid0g: cid,
        integrity_sha256: sha256,
      })
      .select()
      .single();

    if (error) throw error;

    // Return stub response (copied from original)
    return res.status(200).json({
      name: title,
      description,
      left_button: "Left",
      right_button: "Right",
      confidence: confidencePct,
      reason: "Stubbed AI rationale for demo/testing.",
      logId: log.id,
      wagerId,
    });
  } catch (err) {
    console.error("/admin/generate-wager error", err);
    return res.status(500).json({ error: "Failed to generate wager" });
  }
}
