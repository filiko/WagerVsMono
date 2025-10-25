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
    const { amount, currency, chain, vsAmount, transactionSignature } =
      req.body;
    if (!amount || !currency || !chain || !vsAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!transactionSignature) {
      return res.status(400).json({ error: "Transaction signature required" });
    }

    // Stub response (copied from original)
    const purchaseId = `purchase_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    res.json({
      success: true,
      purchaseId,
      status: "completed",
      timestamp: new Date().toISOString(),
      // ... rest of fields
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
