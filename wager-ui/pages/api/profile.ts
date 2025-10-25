import { findUserByToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  // This replaces the middleware
  const user = await findUserByToken(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // The original logic re-fetched the user, but findUserByToken already did that.
  // We can just return the user object we got from the token.
  try {
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
