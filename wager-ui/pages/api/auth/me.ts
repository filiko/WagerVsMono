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

  const user = await findUserByToken(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Original code used req.user, which we now get from findUserByToken
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      solanaPublicKey: user.solana_public_key, // Note snake_case from DB
    },
  });
}
