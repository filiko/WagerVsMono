import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  if (
    !process.env.ALLOW_ANY_ADMIN_LOGIN ||
    !/^(1|true)$/i.test(process.env.ALLOW_ANY_ADMIN_LOGIN)
  ) {
    return res.status(403).json({ error: "Admin dev login disabled" });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    return res.status(200).json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}
