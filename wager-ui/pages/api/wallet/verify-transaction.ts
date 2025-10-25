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
    const { transactionSignature, chain } = req.body;
    if (!transactionSignature || !chain) {
      return res
        .status(400)
        .json({ error: "Transaction signature and chain are required" });
    }

    // Mock verification response (copied from original)
    console.log(`Verifying transaction: ${chain} - ${transactionSignature}`);
    res.json({
      verified: true,
      chain,
      transactionSignature,
      status: "confirmed",
      blockNumber: 12345678,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
