import { NextApiRequest, NextApiResponse } from "next";

type ChainType = "solana" | "ethereum" | "polygon" | "arbitrum" | "base";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { address, chain } = req.query;
    if (!address || !chain) {
      return res.status(400).json({ error: "Address and chain are required" });
    }

    // Mock balance data (copied from original)
    const mockBalances: Record<string, any> = {
      solana: { sol: 2.5, usdc: 100 },
      ethereum: { eth: 0.5, usdc: 500, usdt: 250 },
      // ... etc
    };

    const balances = mockBalances[chain as ChainType] || {};

    res.json({
      address,
      chain,
      balances,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
