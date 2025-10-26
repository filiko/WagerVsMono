import { supabaseAdmin } from "@/lib/supabaseClient";
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
    const { id } = req.query; // Get id from query string

    const { data: prediction, error } = await supabaseAdmin
      .from("predictions")
      .select(
        `
        *,
        prediction_sides (*),
        bets ( *, user:users ( id, name, avatar ) )
      `
      )
      .eq("id", id as string)
      .single();

    if (error || !prediction) {
      return res.status(404).json({ error: "Wager not found" });
    }

    // Transform logic (copied from original)
    const totalVolume =
      prediction.prediction_sides?.reduce(
        (sum: number, side: any) => sum + (side.total_staked || 0),
        0
      ) || 0;
    // ... (rest of transformation logic) ...

    const wager = {
      id: prediction.id,
      title: prediction.title,
      // ... (all other fields) ...
      totalVolume,
    };

    res.status(200).json(wager);
  } catch (error) {
    console.error("Error fetching wager:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
