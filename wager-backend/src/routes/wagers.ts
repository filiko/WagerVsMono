import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// GET /api/wagers - Get all wagers/predictions
router.get("/", async (req, res) => {
  try {
    const { status, category } = req.query;
    
    // Build where clause based on query parameters
    let query = supabaseAdmin
      .from('predictions')
      .select(`
        *,
        prediction_sides (*),
        bets (*)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data: predictions, error } = await query;

    if (error) {
      console.error("Error fetching predictions:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Transform to frontend format
    const wagers = predictions?.map((prediction) => {
      const totalVolume = prediction.prediction_sides?.reduce((sum: number, side: any) => sum + (side.total_staked || 0), 0) || 0;
      const totalParticipants = prediction.prediction_sides?.reduce((sum: number, side: any) => sum + (side.bet_count || 0), 0) || 0;
      
      // Map category to image
      const categoryImageMap: Record<string, string> = {
        'NBA': '/image/basketball.avif',
        'NCAA Basketball': '/image/basketball.avif',
        'NFL': '/image/football.avif',
        'Soccer - La Liga': '/image/football.avif',
        'Soccer - Premier League': '/image/football.avif',
        'Soccer - Champions League': '/image/football.avif',
        'Crypto - Solana': '/image/crypto.avif',
        'Crypto - Ethereum': '/image/crypto.avif',
        'Crypto - Bitcoin': '/image/crypto.avif',
        'Crypto - Meme Coins': '/image/crypto.avif',
        'Esports - League of Legends': '/image/gaming.svg',
        'Esports - CS2': '/image/gaming.svg',
        'Esports - Valorant': '/image/gaming.svg',
      };

      return {
        id: prediction.id,
        title: prediction.title,
        description: prediction.description || '',
        imageUrl: categoryImageMap[prediction.category] || null,
        category: prediction.category.toLowerCase().replace(/\s+/g, '_'),
        status: prediction.status,
        isPublic: true,
        winningSide: prediction.result,
        side1Title: prediction.prediction_sides?.[0]?.name || 'YES',
        side2Title: prediction.prediction_sides?.[1]?.name || 'NO',
        side1Amount: prediction.prediction_sides?.[0]?.total_staked || 0,
        side2Amount: prediction.prediction_sides?.[1]?.total_staked || 0,
        endTime: prediction.lock_time?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: prediction.created_at,
        updatedAt: prediction.updated_at,
        createdById: prediction.user_id || null,
        participants: totalParticipants,
        aiPrediction: prediction.ai_prediction,
        predictionReasoning: prediction.prediction_reasoning,
        payoutTime: prediction.payout_time?.toISOString(),
        totalVolume,
        sides: prediction.prediction_sides?.map((side: any) => ({
          id: side.id,
          name: side.name,
          description: side.description,
          totalStaked: side.total_staked,
          betCount: side.bet_count,
        })) || [],
      };
    }) || [];

    res.json(wagers);
  } catch (error) {
    console.error("Error fetching wagers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/wagers/:id - Get specific wager
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: prediction, error } = await supabaseAdmin
      .from('predictions')
      .select(`
        *,
        prediction_sides (*),
        bets (
          *,
          user:users (
            id,
            name,
            avatar
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !prediction) {
      return res.status(404).json({ error: "Wager not found" });
    }

    const totalVolume = prediction.prediction_sides?.reduce((sum: number, side: any) => sum + (side.total_staked || 0), 0) || 0;
    const totalParticipants = prediction.prediction_sides?.reduce((sum: number, side: any) => sum + (side.bet_count || 0), 0) || 0;

    const wager = {
      id: prediction.id,
      title: prediction.title,
      description: prediction.description || '',
      category: prediction.category,
      status: prediction.status,
      isPublic: true,
      winningSide: prediction.result,
      endTime: prediction.lock_time?.toISOString(),
      payoutTime: prediction.payout_time?.toISOString(),
      createdAt: prediction.created_at,
      createdById: prediction.user_id,
      participants: totalParticipants,
      totalVolume,
      aiPrediction: prediction.ai_prediction,
      predictionReasoning: prediction.prediction_reasoning,
      sides: prediction.prediction_sides?.map((side: any) => ({
        id: side.id,
        name: side.name,
        description: side.description,
        totalStaked: side.total_staked,
        betCount: side.bet_count,
      })) || [],
      recentBets: prediction.bets?.slice(-10).map((bet: any) => ({
        id: bet.id,
        amount: bet.amount,
        sideId: bet.side_id,
        user: bet.user,
        createdAt: bet.created_at,
      })) || [],
    };

    res.json(wager);
  } catch (error) {
    console.error("Error fetching wager:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/wagers - Create new wager (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, category, side1Title, side2Title, endTime } = req.body;
    
    if (!title || !category || !side1Title || !side2Title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // For now, return mock response
    const mockWager = {
      id: Math.floor(Math.random() * 1000) + 100,
      title,
      description: description || "",
      category,
      status: "active",
      isPublic: true,
      side1Title,
      side2Title,
      side1Amount: 0,
      side2Amount: 0,
      endTime: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      createdById: req.user?.id || 1,
      participants: 0
    };

    res.status(201).json(mockWager);
  } catch (error) {
    console.error("Error creating wager:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
