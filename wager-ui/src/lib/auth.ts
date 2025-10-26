import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "./supabaseClient";

interface JwtPayload {
  userId: string; // Supabase UUIDs are strings
}

// This function replaces the old 'authenticateToken' middleware
export const findUserByToken = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // THE FIX: Find the user in Supabase by their ID
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return null;
    }

    // Return the full user object
    return user;
  } catch (error) {
    // Invalid token, expired, etc.
    return null;
  }
};
