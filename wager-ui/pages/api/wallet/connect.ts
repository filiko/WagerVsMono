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
    const { address, chain } = req.body;
    if (!address || !chain) {
      return res.status(400).json({ error: "Address and chain are required" });
    }
    // Stub response (copied from original)
    console.log(`Wallet connected: ${chain} - ${address}`);
    res.json({
      success: true,
      message: `${chain} wallet connected successfully`,
      address,
      chain,
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
