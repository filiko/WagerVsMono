"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const supabase_1 = require("./lib/supabase");
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const legacy_1 = __importDefault(require("./routes/legacy"));
const predictions_1 = __importDefault(require("./routes/predictions"));
const auth_2 = require("./middleware/auth");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api", legacy_1.default);
app.use("/api/predictions", predictions_1.default);
// Protected route example
app.get("/api/profile", auth_2.authenticateToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase_1.supabaseAdmin
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
    }
    catch (error) {
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
const ADMIN_STATIC_DIR = process.env.ADMIN_STATIC_DIR ||
    path_1.default.resolve("C:\\Users\\jafil\\Documents\\GitHub\\WagerVSDev_Testing\\admin");
app.use("/admin", express_1.default.static(ADMIN_STATIC_DIR, { extensions: ["html"] }));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
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
//# sourceMappingURL=index.js.map