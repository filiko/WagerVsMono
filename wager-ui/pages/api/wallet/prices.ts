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
    // Mock price data (copied from original)
    const prices = {
      solana: { sol: 180.5, usdc: 1.0 },
      ethereum: { eth: 3500.0, usdc: 1.0, usdt: 1.0 },
      // ... etc
    };

    res.json({
      prices,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
