import { findUserByToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // This route is protected
    const user = await findUserByToken(req);
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Stub response (copied from original)
    res.json({
      success: true,
      message: "Wallet disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
