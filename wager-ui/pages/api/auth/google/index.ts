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
    const { userInfo, accessToken } = req.body;
    if (!userInfo || !accessToken)
      return res
        .status(400)
        .json({ message: "Missing user info or access token" });

    // ... (All Google verification logic from original auth.ts) ...
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    if (!response.ok) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    const googleUserInfo = (await response.json()) as any;
    if (
      googleUserInfo.id !== userInfo.id ||
      googleUserInfo.email !== userInfo.email
    ) {
      return res.status(401).json({ message: "User info mismatch" });
    }

    const { email, name, picture, id } = userInfo;

    // Find or create user in Supabase (logic copied from original)
    let { data: user, error: findError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (findError && findError.code !== "PGRST116") throw findError;

    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          email,
          name,
          avatar: picture,
          google_id: id,
          provider: "google",
        })
        .select()
        .single();
      if (createError) throw createError;
      user = newUser;
    } else {
      // Update existing user (logic copied from original)
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          google_id: id,
          provider: "google",
          name: user.name || name,
          avatar: user.avatar || picture,
          last_login: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updatedUser;
    }

    // Create our custom JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Set the cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: "/",
      })
    );

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
}
