"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const client = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});
router.post("/google", async (req, res) => {
    try {
        const { userInfo, accessToken } = req.body;
        if (!userInfo || !accessToken)
            return res
                .status(400)
                .json({ message: "Missing user info or access token" });
        // Verify the access token with Google
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
        if (!response.ok) {
            return res.status(401).json({ message: "Invalid access token" });
        }
        const googleUserInfo = (await response.json());
        // Verify that the user info matches what was sent
        if (googleUserInfo.id !== userInfo.id ||
            googleUserInfo.email !== userInfo.email) {
            return res.status(401).json({ message: "User info mismatch" });
        }
        const { email, name, picture, id } = userInfo;
        let { data: user, error: findError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }
        if (!user) {
            const { data: newUser, error: createError } = await supabase_1.supabaseAdmin
                .from('users')
                .insert({
                email,
                name,
                avatar: picture,
                google_id: id,
                provider: "google",
            })
                .select()
                .single();
            if (createError)
                throw createError;
            user = newUser;
        }
        else {
            // Update existing user with Google info if not already linked
            if (!user.google_id) {
                const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                    .from('users')
                    .update({
                    google_id: id,
                    provider: "google",
                    name: user.name || name,
                    avatar: user.avatar || picture,
                    last_login: new Date().toISOString(),
                })
                    .eq('id', user.id)
                    .select()
                    .single();
                if (updateError)
                    throw updateError;
                user = updatedUser;
            }
            else {
                // Update last login for existing Google user
                const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                    .from('users')
                    .update({
                    last_login: new Date().toISOString(),
                    name: user.name || name,
                    avatar: user.avatar || picture,
                })
                    .eq('id', user.id)
                    .select()
                    .single();
                if (updateError)
                    throw updateError;
                user = updatedUser;
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.json({ user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Google auth failed" });
    }
});
// 2) Callback endpoint that receives 'code' from Google
router.get("/google/callback", async (req, res) => {
    try {
        const code = req.query.code;
        if (!code)
            return res.status(400).send("Missing code");
        // Exchange code for tokens
        const { tokens } = await client.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });
        // tokens contains: access_token, id_token, refresh_token (maybe)
        const idToken = tokens.id_token;
        if (!idToken)
            return res.status(400).send("No ID token returned from Google");
        // Verify ID token and parse payload
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            return res.status(401).send("Invalid ID token");
        const { sub: googleId, email, email_verified, name, picture, } = payload;
        if (!email || !email_verified) {
            return res.status(400).send("Email not verified by Google");
        }
        // Upsert user in DB
        let { data: user, error: findError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('google_id', googleId)
            .single();
        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }
        if (!user) {
            // If user with this googleId not found, maybe a user exists with same email — link
            const { data: existingUser, error: emailError } = await supabase_1.supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (emailError && emailError.code !== 'PGRST116') {
                throw emailError;
            }
            if (existingUser) {
                // link googleId
                const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                    .from('users')
                    .update({
                    google_id: googleId,
                    provider: "google",
                    last_login: new Date().toISOString(),
                    name: existingUser.name || name,
                    avatar: existingUser.avatar || picture,
                })
                    .eq('id', existingUser.id)
                    .select()
                    .single();
                if (updateError)
                    throw updateError;
                user = updatedUser;
            }
            else {
                // create new user
                const { data: newUser, error: createError } = await supabase_1.supabaseAdmin
                    .from('users')
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
                if (createError)
                    throw createError;
                user = newUser;
            }
        }
        else {
            // existing google user — update lastLogin/profile
            const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                .from('users')
                .update({
                last_login: new Date().toISOString(),
                name: user.name || name,
                avatar: user.avatar || picture,
            })
                .eq('id', user.id)
                .select()
                .single();
            if (updateError)
                throw updateError;
            user = updatedUser;
        }
        // TODO: store refresh_token if you requested offline access and need long-term Google API access:
        // tokens.refresh_token may be present on first consent.
        // Issue our own JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Set HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // Redirect back to client app (frontend). You can pass state or token if needed; prefer cookie/session.
        return res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    }
    catch (err) {
        console.error("Google callback error:", err);
        return res.status(500).send("Authentication error");
    }
});
// 3) get current user
router.get("/me", auth_1.authenticateToken, (req, res) => {
    const u = req.user;
    res.json({
        user: {
            id: u.id,
            email: u.email,
            name: u.name,
            avatar: u.avatar,
            provider: u.provider,
            solanaPublicKey: u.solanaPublicKey,
        },
    });
});
// 4) Solana wallet authentication
router.post("/solana", async (req, res) => {
    try {
        const { publicKey, signature, message } = req.body;
        if (!publicKey || !signature || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Verify the signature (basic verification - in production, you'd want more robust verification)
        // For now, we'll trust the wallet connection and create/update user
        // Check if user exists with this Solana public key
        let { data: user, error: findError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('solana_public_key', publicKey)
            .single();
        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }
        if (!user) {
            // Create new user with Solana wallet
            const username = `Solana User ${publicKey.slice(0, 8)}`;
            const firstLetter = username.charAt(0).toUpperCase();
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=9A2BD8&color=ffffff&size=96`;
            const { data: newUser, error: createError } = await supabase_1.supabaseAdmin
                .from('users')
                .insert({
                solana_public_key: publicKey,
                name: username,
                avatar: avatarUrl,
                provider: "solana",
                last_login: new Date().toISOString(),
            })
                .select()
                .single();
            if (createError)
                throw createError;
            user = newUser;
        }
        else {
            // Update existing user
            const fallbackUsername = `Solana User ${publicKey.slice(0, 8)}`;
            const firstLetter = (user.name || fallbackUsername)
                .charAt(0)
                .toUpperCase();
            const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=9A2BD8&color=ffffff&size=96`;
            const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                .from('users')
                .update({
                solana_public_key: publicKey,
                provider: "solana",
                last_login: new Date().toISOString(),
                // If user has no avatar yet, set a generated one so UI can render immediately
                avatar: user.avatar ?? generatedAvatar,
                // If user has no name yet, set a fallback username based on wallet
                name: user.name ?? fallbackUsername,
            })
                .eq('id', user.id)
                .select()
                .single();
            if (updateError)
                throw updateError;
            user = updatedUser;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ user });
    }
    catch (err) {
        console.error("Solana auth error:", err);
        res.status(500).json({ message: "Solana authentication failed" });
    }
});
// 5) logout
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out" });
});
exports.default = router;
//# sourceMappingURL=auth.js.map