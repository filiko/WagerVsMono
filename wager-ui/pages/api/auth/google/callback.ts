import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { supabaseAdmin } from "@/lib/supabaseClient";

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI, // This must match Vercel env var
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const code = req.query.code as string | undefined;
    if (!code) return res.status(400).send("Missing code");

    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const idToken = tokens.id_token;
    if (!idToken)
      return res.status(400).send("No ID token returned from Google");

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).send("Invalid ID token");

    const {
      sub: googleId,
      email,
      email_verified,
      name,
      picture,
    } = payload as any;

    if (!email || !email_verified) {
      return res.status(400).send("Email not verified by Google");
    }

    // Upsert user in DB (logic copied from original auth.ts)
    let { data: user, error: findError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("google_id", googleId)
      .single();

    // ... (rest of the upsert logic from original auth.ts file) ...
    if (findError && findError.code !== "PGRST116") throw findError;

    if (!user) {
      // ... (find by email, create new, or link existing logic) ...
      // This is a direct copy of your original backend logic
      const { data: existingUser, error: emailError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      // ... etc ...
      // (Assuming you copy the full logic block from auth.ts here)

      // For brevity, I'll just show the final user creation path
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabaseAdmin
          .from("users")
          .insert({
            google_id: googleId,
            email,
            name,
            avatar: picture,
            provider: "google",
            last_login: new Date().toISOString(),
          })
          .select()
          .single();
        if (createError) throw createError;
        user = newUser;
      } else {
        // link
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            google_id: googleId,
            provider: "google",
            last_login: new Date().toISOString(),
            name: existingUser.name || name,
            avatar: existingUser.avatar || picture,
          })
          .eq("id", existingUser.id)
          .select()
          .single();
        if (updateError) throw updateError;
        user = updatedUser;
      }
    } else {
      // update existing
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          name: user.name || name,
          avatar: user.avatar || picture,
        })
        .eq("id", user.id)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updatedUser;
    }

    // Issue our own JWT
    const token = jwt.sign(
      { userId: user!.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Set HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // 'none' might be needed if frontend/backend domains differ
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
    );

    // Redirect back to client app
    return res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  } catch (err: any) {
    console.error("Google callback error:", err);
    return res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
}
