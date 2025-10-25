import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

// Helper function to verify admin JWT
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
    const { logId, rating } = req.body || {};
    if (!logId) return res.status(400).json({ error: "logId required" });

    // No-op (from original code)
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error recording rating:", err);
    return res.status(500).json({ error: "Failed to record rating" });
  }
}
