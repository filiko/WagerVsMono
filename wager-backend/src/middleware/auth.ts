// wager-backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../lib/supabase"; // Import Supabase admin client

// Define the expected structure of the JWT payload
interface JwtPayload {
  userId: string; // Ensure this matches how you sign the token (should be Supabase UUID string)
}

// NOTE: The 'declare global' block defining req.user should ideally live in ONE place,
// often a dedicated types file (e.g., types/express.d.ts) or maybe auth.ts.
// If you deleted it from here earlier, that's fine. If not, delete it now
// to avoid conflicts with the definition in auth.ts.

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract token from cookie or Authorization header
    const token =
      req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    // 2. Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 3. Find the user in SUPABASE using the userId from the token
    const { data: user, error: dbError } = await supabaseAdmin
      .from("users")
      .select(
        `
        id,
        email,
        role,
        name,
        avatar,
        provider,
        solana_public_key
      `
      ) // Select fields needed for req.user
      .eq("id", decoded.userId) // Use the string UUID
      .single();

    // Handle database errors or user not found
    if (dbError || !user) {
      console.error(
        "Auth middleware: User not found in Supabase for ID:",
        decoded.userId,
        dbError
      );
      return res.status(401).json({ error: "User not found or invalid token" });
    }

    // 4. Attach the user object (conforming to the string ID type) to the request
    // Map snake_case (solana_public_key) to camelCase if needed by the type definition
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      solanaPublicKey: user.solana_public_key, // Map here
    };

    // 5. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Handle specific JWT errors (expired, invalid signature)
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: `Invalid token: ${error.message}` });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    // Generic error for other issues
    return res.status(401).json({ error: "Authentication failed" });
  }
};
