import { findUserByToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // --- GET /api/wagers ---
    try {
      const { status, category } = req.query;

      let query = supabaseAdmin
        .from("predictions") // NOTE: Your DB query uses 'predictions' table
        .select(`*, prediction_sides (*), bets (*)`)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status as string);
      }
      if (category) {
        query = query.eq("category", category as string);
      }

      const { data: predictions, error } = await query;
      if (error) throw error;

      // Transform logic (copied from original)
      const wagers =
        predictions?.map((prediction: any) => {
          // ... (all transformation logic from original wagers.ts) ...
          const totalVolume =
            prediction.prediction_sides?.reduce(
              (sum: number, side: any) => sum + (side.total_staked || 0),
              0
            ) || 0;
          const totalParticipants =
            prediction.prediction_sides?.reduce(
              (sum: number, side: any) => sum + (side.bet_count || 0),
              0
            ) || 0;
          return {
            id: prediction.id,
            title: prediction.title,
            // ... etc
            totalVolume,
            participants: totalParticipants,
          };
        }) || [];

      res.status(200).json(wagers);
    } catch (error) {
      console.error("Error fetching wagers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "POST") {
    // --- POST /api/wagers ---
    try {
      const user = await findUserByToken(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, category, side1Title, side2Title, endTime } =
        req.body;
      if (!title || !category || !side1Title || !side2Title) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Mock response (copied from original)
      const mockWager = {
        id: Math.floor(Math.random() * 1000) + 100,
        title,
        description: description || "",
        category,
        status: "active",
        createdById: user.id, // Use the authenticated user's ID
        // ... (rest of mock response) ...
      };
      res.status(201).json(mockWager);
    } catch (error) {
      console.error("Error creating wager:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
