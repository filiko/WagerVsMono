import { Router, Request, Response, NextFunction } from "express"; // Import Request, Response, NextFunction
import jwt from "jsonwebtoken";
// Assuming you have these somewhere, adjust paths if needed
import { recordPredictionTo0G } from "../services/zeroG";
import { supabaseAdmin } from "../lib/supabase"; // Use Supabase admin client
import { randomUUID } from "crypto";

// --- TYPE AUGMENTATION ---
declare global {
  namespace Express {
    interface Request {
      admin?: {
        username: string;
      };
    }
  }
}
// --- END TYPE AUGMENTATION ---

const router = Router();

// Admin login (dev-only when ALLOW_ANY_ADMIN_LOGIN is true)
router.post("/login", (req: Request, res: Response) => {
  // Add types
  if (
    !process.env.ALLOW_ANY_ADMIN_LOGIN ||
    !/^(1|true)$/i.test(process.env.ALLOW_ANY_ADMIN_LOGIN)
  ) {
    return res.status(403).json({ error: "Admin dev login disabled" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    return res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// Middleware to verify the admin JWT without DB lookup.
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Add types
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    if (!decoded || decoded.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Attach admin info to request object (TypeScript now knows about this thanks to augmentation)
    req.admin = { username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Simple protected endpoint used by admin/checkAuth.js
router.get("/data", requireAdmin, (req: Request, res: Response) => {
  // Add types
  return res.json({ ok: true, admin: req.admin?.username || "admin" });
});

router.post(
  "/generate-wager",
  requireAdmin,
  async (req: Request, res: Response) => {
    // Add types
    try {
      const { description, timezoneOffset } = req.body || {};
      if (!description || typeof description !== "string") {
        return res.status(400).json({ error: "description is required" });
      }

      // Very simple stub: infer a title and sides from description.
      const title = description.slice(0, 60).trim() || "AI Suggested Wager";
      const left = "Left";
      const right = "Right";
      const confidencePct = Math.round(50 + Math.random() * 40); // 50–90
      const reason = "Stubbed AI rationale for demo/testing.";

      // Record immutable artifact on 0G (or local stub)
      const wagerId = `ai-${randomUUID()}`;
      const createdUtc = new Date().toISOString();
      const { cid, sha256 } = await recordPredictionTo0G({
        wagerId,
        title,
        confidencePct,
        model: { provider: "openai", name: "gpt-4x-mini", version: "stub" },
        createdUtc,
      });

      // Persist the log to Supabase DB
      const { data: log, error } = await supabaseAdmin
        .from("ai_prediction_logs")
        .insert({
          wager_id: wagerId,
          title: title,
          confidence_pct: confidencePct,
          model_provider: "openai",
          model_name: "gpt-4x-mini",
          model_version: "stub",
          created_utc: new Date(createdUtc),
          server_received_utc: new Date(),
          app_env: process.env.APP_ENV ?? "prod",
          cid0g: cid,
          integrity_sha256: sha256,
        })
        .select()
        .single();

      if (error) throw error; // Handle Supabase errors

      return res.json({
        name: title,
        description,
        left_button: left,
        right_button: right,
        confidence: confidencePct,
        reason,
        lock_at_suggested: undefined,
        expires_at_suggested: undefined,
        category_key: undefined,
        logId: log.id,
        wagerId,
      });
    } catch (err) {
      console.error("/admin/generate-wager error", err);
      return res.status(500).json({ error: "Failed to generate wager" });
    }
  }
);

// Optional: accept rating feedback for AI generation; best-effort stub.
router.post(
  "/rate-ai-generation",
  requireAdmin,
  async (req: Request, res: Response) => {
    // Add types
    try {
      const { logId, rating } = req.body || {};
      if (!logId) return res.status(400).json({ error: "logId required" });
      // No-op: could store rating on a column or separate table.
      return res.json({ ok: true });
    } catch (err) {
      console.error("Error rating AI generation:", err); // Added log
      return res.status(500).json({ error: "Failed to record rating" });
    }
  }
);

export default router;
