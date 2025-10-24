import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { supabaseAdmin } from "./lib/supabase";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import legacyRoutes from "./routes/legacy";
import predictionsRoutes from "./routes/predictions";
import { authenticateToken } from "./middleware/auth";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", legacyRoutes);
app.use("/api/predictions", predictionsRoutes);

// Protected route example
app.get("/api/profile", authenticateToken, async (req: any, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar, role, created_at, last_login')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: process.env.SUPABASE_URL ? "connected" : "disconnected",
    database: "supabase",
    timestamp: new Date().toISOString(),
  });
});

// Serve static Admin portal from external directory
const ADMIN_STATIC_DIR =
  process.env.ADMIN_STATIC_DIR ||
  path.resolve("C:\\Users\\jafil\\Documents\\GitHub\\WagerVSDev_Testing\\admin");

app.use("/admin", express.static(ADMIN_STATIC_DIR, { extensions: ["html"] }));

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database URL: ${process.env.DATABASE_URL}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  process.exit(0);
});
