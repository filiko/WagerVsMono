import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { supabaseAdmin } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { publicKey, signature, message } = req.body;
    if (!publicKey || !signature || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // TODO: Add actual Solana signature verification here
    // const { verify } = await import('@solana/wallet-adapter-base');
    // const verified = verify(message, signature, publicKey);
    // if (!verified) return res.status(401).json({ message: "Invalid signature" });

    // Upsert user (logic copied from original auth.ts)
    let { data: user, error: findError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("solana_public_key", publicKey)
      .single();

    if (findError && findError.code !== "PGRST116") throw findError;

    if (!user) {
      // Create new user (logic copied from original)
      const username = `Solana User ${publicKey.slice(0, 8)}`;
      const firstLetter = username.charAt(0).toUpperCase();
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        firstLetter
      )}&background=9A2BD8&color=ffffff&size=96`;

      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          solana_public_key: publicKey,
          name: username,
          avatar: avatarUrl,
          provider: "solana",
          last_login: new Date().toISOString(),
        })
        .select()
        .single();
      if (createError) throw createError;
      user = newUser;
    } else {
      // Update existing user (logic copied from original)
      // ... (copy update logic from auth.ts here) ...
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updatedUser;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Set HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
    );

    res.status(200).json({ user });
  } catch (err) {
    console.error("Solana auth error:", err);
    res.status(500).json({ message: "Solana authentication failed" });
  }
}
