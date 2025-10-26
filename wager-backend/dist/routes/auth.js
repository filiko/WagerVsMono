"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Make sure Request, Response, Router are imported
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
const auth_1 = require("../middleware/auth"); // Ensure this path is correct
// --- END TYPE AUGMENTATION ---
const router = (0, express_1.Router)();
// Initialize Google OAuth client
const client = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});
// --- 1) Google Sign-In (using access token from frontend) ---
router.post("/google", async (req, res) => {
    try {
        const { userInfo, accessToken } = req.body;
        if (!userInfo || !accessToken) {
            return res
                .status(400)
                .json({ message: "Missing user info or access token" });
        }
        // Verify the access token directly with Google
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
        if (!response.ok) {
            console.error("Google token verification failed:", await response.text());
            return res.status(401).json({ message: "Invalid access token" });
        }
        const googleUserInfo = (await response.json());
        // Double-check user info consistency
        if (googleUserInfo.id !== userInfo.id ||
            googleUserInfo.email !== userInfo.email) {
            console.warn("User info mismatch:", googleUserInfo, userInfo);
            return res.status(401).json({ message: "User info mismatch" });
        }
        const { email, name, picture, id: google_id } = userInfo; // Renamed id to google_id
        // Find or create user in Supabase
        let { data: user, error: findError } = await supabase_1.supabaseAdmin
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
        // Handle potential Supabase errors (excluding 'not found')
        if (findError && findError.code !== "PGRST116") {
            console.error("Supabase find user error:", findError);
            throw findError;
        }
        if (!user) {
            // Create new user if not found by email
            console.log("Creating new user for:", email);
            const { data: newUser, error: createError } = await supabase_1.supabaseAdmin
                .from("users")
                .insert({
                email,
                name,
                avatar: picture,
                google_id: google_id, // Use the renamed variable
                provider: "google",
            })
                .select()
                .single();
            if (createError) {
                console.error("Supabase create user error:", createError);
                throw createError;
            }
            user = newUser;
        }
        else {
            // Update existing user found by email
            console.log("Updating existing user:", email);
            const updateData = {
                // Use 'any' or define a specific update type
                last_login: new Date().toISOString(),
                name: user.name || name, // Keep existing name if present
                avatar: user.avatar || picture, // Keep existing avatar if present
            };
            // Only link Google ID if it's not already linked
            if (!user.google_id) {
                updateData.google_id = google_id;
                updateData.provider = "google"; // Update provider if linking
            }
            const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                .from("users")
                .update(updateData)
                .eq("id", user.id)
                .select()
                .single();
            if (updateError) {
                console.error("Supabase update user error:", updateError);
                throw updateError;
            }
            user = updatedUser;
        }
        // Issue your application's JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        // Set JWT as an HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set Secure flag in production
            sameSite: "lax", // Adjust as needed ('lax' is common)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
        // Send back user info (optional, depends on frontend needs)
        res.json({ user });
    }
    catch (err) {
        console.error("POST /google error:", err);
        res.status(500).json({ message: "Google authentication failed" });
    }
});
// --- 2) Google OAuth Callback (Server-side flow, less common if frontend handles token) ---
router.get("/google/callback", async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            console.error("Missing code in Google callback");
            return res.status(400).send("Missing authorization code");
        }
        // Exchange authorization code for tokens
        const { tokens } = await client.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI, // Must match Google Console setup
        });
        const idToken = tokens.id_token;
        if (!idToken) {
            console.error("No ID token returned from Google");
            return res.status(400).send("No ID token returned from Google");
        }
        // Verify the ID token and extract user info
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, // Verify it's intended for your app
        });
        const payload = ticket.getPayload();
        if (!payload) {
            console.error("Invalid ID token payload");
            return res.status(401).send("Invalid ID token");
        }
        const { sub: googleId, email, email_verified, name, picture } = payload;
        if (!email || !email_verified) {
            console.error("Email not provided or not verified by Google");
            return res.status(400).send("Email not verified by Google");
        }
        // Upsert user logic (similar to POST /google, but uses googleId first)
        let { data: user, error: findError } = await supabase_1.supabaseAdmin
            .from("users")
            .select("*")
            .eq("google_id", googleId) // Try finding by Google ID first
            .single();
        if (findError && findError.code !== "PGRST116") {
            console.error("Supabase find by google_id error:", findError);
            throw findError;
        }
        if (!user) {
            // If not found by Google ID, try finding by email to link accounts
            const { data: existingUser, error: emailError } = await supabase_1.supabaseAdmin
                .from("users")
                .select("*")
                .eq("email", email)
                .single();
            if (emailError && emailError.code !== "PGRST116") {
                console.error("Supabase find by email error:", emailError);
                throw emailError;
            }
            if (existingUser) {
                // User exists with this email, link Google ID
                console.log("Linking Google ID to existing user:", email);
                const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
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
                if (updateError) {
                    console.error("Supabase link Google ID error:", updateError);
                    throw updateError;
                }
                user = updatedUser;
            }
            else {
                // User doesn't exist, create a new one
                console.log("Creating new user via callback for:", email);
                const { data: newUser, error: createError } = await supabase_1.supabaseAdmin
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
                if (createError) {
                    console.error("Supabase create user via callback error:", createError);
                    throw createError;
                }
                user = newUser;
            }
        }
        else {
            // User found by Google ID, update profile info and last login
            console.log("Updating existing Google user via callback:", email);
            const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                .from("users")
                .update({
                last_login: new Date().toISOString(),
                name: user.name || name,
                avatar: user.avatar || picture,
            })
                .eq("id", user.id)
                .select()
                .single();
            if (updateError) {
                console.error("Supabase update Google user via callback error:", updateError);
                throw updateError;
            }
            user = updatedUser;
        }
        // Issue your application's JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, // Use the Supabase user ID
        process.env.JWT_SECRET, { expiresIn: "7d" });
        // Set HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust if needed
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/", // Ensure cookie path is appropriate
        });
        // Redirect back to the frontend application
        const redirectUrl = process.env.CLIENT_URL
            ? `${process.env.CLIENT_URL}/auth/success`
            : "/"; // Fallback redirect
        return res.redirect(redirectUrl);
    }
    catch (err) {
        console.error("Google callback route error:", err);
        const errorRedirectUrl = process.env.CLIENT_URL
            ? `${process.env.CLIENT_URL}/auth/error`
            : "/"; // Fallback error redirect
        return res.redirect(errorRedirectUrl); // Redirect to an error page on frontend
    }
});
// --- 3) Get Current User (/me) ---
router.get("/me", auth_1.authenticateToken, (req, res) => {
    // authenticateToken middleware runs first. If it calls next(), req.user is guaranteed to exist.
    const u = req.user; // Use non-null assertion '!'
    // Optional safety check (middleware should handle unauthorized cases)
    if (!u) {
        console.error("/me route called without req.user after authenticateToken");
        return res.status(401).json({ error: "Authentication data missing" });
    }
    // Respond with selected user details
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
// --- 4) Solana Wallet Authentication ---
router.post("/solana", async (req, res) => {
    try {
        const { publicKey, signature, message } = req.body;
        if (!publicKey || !signature || !message) {
            return res.status(400).json({
                message: "Missing required fields: publicKey, signature, message",
            });
        }
        // TODO: Implement actual Solana signature verification here!
        // This is crucial for security. Use libraries like '@solana/web3.js' or others.
        // Example (conceptual, needs proper implementation):
        // const verified = verifySolanaSignature(publicKey, signature, message);
        // if (!verified) {
        //   return res.status(401).json({ message: "Invalid Solana signature" });
        // }
        // Check if user exists with this Solana public key
        let { data: user, error: findError } = await supabase_1.supabaseAdmin
            .from("users")
            .select("*")
            .eq("solana_public_key", publicKey)
            .single();
        if (findError && findError.code !== "PGRST116") {
            console.error("Supabase find by solana_public_key error:", findError);
            throw findError;
        }
        if (!user) {
            // Create new user for this Solana wallet
            console.log("Creating new user for Solana wallet:", publicKey.slice(0, 8));
            const username = `Solana User ${publicKey.slice(0, 8)}`; // Generate default username
            const firstLetter = username.charAt(0).toUpperCase();
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=9A2BD8&color=ffffff&size=96`; // Generate default avatar
            const { data: newUser, error: createError } = await supabase_1.supabaseAdmin
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
            if (createError) {
                console.error("Supabase create Solana user error:", createError);
                throw createError;
            }
            user = newUser;
        }
        else {
            // User found, update last login and maybe profile details if missing
            console.log("Updating existing Solana user:", publicKey.slice(0, 8));
            const fallbackUsername = `Solana User ${publicKey.slice(0, 8)}`;
            const firstLetter = (user.name || fallbackUsername)
                .charAt(0)
                .toUpperCase();
            const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=9A2BD8&color=ffffff&size=96`;
            const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
                .from("users")
                .update({
                last_login: new Date().toISOString(),
                // Only update name/avatar if they are currently null
                name: user.name ?? fallbackUsername,
                avatar: user.avatar ?? generatedAvatar,
                // Ensure provider is set if somehow missing
                provider: user.provider ?? "solana",
                // Ensure sol key is set if somehow missing (shouldn't happen here)
                solana_public_key: user.solana_public_key ?? publicKey,
            })
                .eq("id", user.id)
                .select()
                .single();
            if (updateError) {
                console.error("Supabase update Solana user error:", updateError);
                throw updateError;
            }
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
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust if needed
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });
        res.json({ user }); // Send back user info
    }
    catch (err) {
        console.error("POST /solana error:", err);
        res.status(500).json({ message: "Solana authentication failed" });
    }
});
// --- 5) Logout ---
router.post("/logout", (req, res) => {
    // Clear the HttpOnly cookie by setting an expired date or maxAge=0
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });
    // Or alternatively:
    // res.cookie("token", "", { maxAge: 0, httpOnly: true, ... });
    res.status(200).json({ message: "Logged out successfully" });
});
exports.default = router;
//# sourceMappingURL=auth.js.map