import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  res.status(200).json({
    status: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "connected"
      : "disconnected",
    database: "supabase",
    timestamp: new Date().toISOString(),
  });
}
