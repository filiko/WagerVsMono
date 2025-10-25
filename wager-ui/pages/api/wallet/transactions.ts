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

  try {
    // This route is protected
    const user = await findUserByToken(req);
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { chain, limit = 10 } = req.query;

    // Mock transaction history (copied from original)
    const mockTransactions = [
      { id: "tx_1", type: "purchase", chain: "solana" /* ... */ },
      { id: "tx_2", type: "purchase", chain: "ethereum" /* ... */ },
    ];

    const filteredTransactions = chain
      ? mockTransactions.filter((tx) => tx.chain === chain)
      : mockTransactions;

    res.json({
      transactions: filteredTransactions.slice(0, Number(limit)),
      total: filteredTransactions.length,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
