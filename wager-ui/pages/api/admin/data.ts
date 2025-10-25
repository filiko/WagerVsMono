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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const admin = verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Original stub response
  return res.json({ ok: true, admin: admin.username || "admin" });
}
