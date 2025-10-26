"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Import Request, Response, NextFunction
const supabase_1 = require("../lib/supabase");
const zeroG_1 = require("../services/zeroG");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Simple internal guard: require X-Internal-Key header if configured
function requireInternalKey(req, res, next) {
    // Add types
    const expected = process.env.PREDICTION_INTERNAL_KEY;
    if (!expected) {
        // If no key is set, allow in development/testing environments
        console.warn("PREDICTION_INTERNAL_KEY not set, allowing request.");
        return next();
    }
    const got = (req.headers["x-internal-key"] || req.query.key || "");
    if (!got || got !== expected) {
        console.error("Unauthorized prediction API access attempt.");
        return res
            .status(401)
            .json({ error: "Unauthorized: Invalid or missing API key" });
    }
    next();
}
/**
 * POST /api/predictions/record
 * Records an AI prediction artifact and stores metadata.
 * Body: {
 * wagerId: string,
 * title: string,
 * confidencePct?: number,
 * model: { provider: string; name: string; version?: string },
 * createdUtc: string (ISO 8601 format),
 * }
 * Response: { id: number, cid: string, sha256: string }
 */
router.post("/record", requireInternalKey, async (req, res) => {
    // Add types
    try {
        const { wagerId, title, confidencePct, model, createdUtc } = req.body || {};
        // Validate required fields
        if (!wagerId ||
            typeof wagerId !== "string" ||
            !title ||
            typeof title !== "string" ||
            !model?.provider ||
            typeof model.provider !== "string" ||
            !model?.name ||
            typeof model.name !== "string" ||
            !createdUtc ||
            typeof createdUtc !== "string" ||
            isNaN(Date.parse(createdUtc))) {
            return res.status(400).json({
                error: "Missing or invalid required fields (wagerId, title, model.provider, model.name, createdUtc)",
            });
        }
        // Optional field validation
        if (confidencePct !== undefined &&
            (typeof confidencePct !== "number" ||
                confidencePct < 0 ||
                confidencePct > 100)) {
            return res.status(400).json({
                error: "Invalid confidencePct (must be a number between 0 and 100)",
            });
        }
        // 1) Upload canonical artifact to 0G (or local stub)
        const { cid, sha256, artifact } = await (0, zeroG_1.recordPredictionTo0G)({
            wagerId,
            title,
            confidencePct,
            model,
            createdUtc,
        });
        // 2) Persist metadata pointer in Supabase DB
        const { data: log, error } = await supabase_1.supabaseAdmin
            .from("ai_prediction_logs")
            .insert({
            wager_id: wagerId,
            title,
            confidence_pct: typeof confidencePct === "number" ? confidencePct : null,
            model_provider: model.provider,
            model_name: model.name,
            model_version: model.version ?? null, // Handle optional model version
            created_utc: new Date(createdUtc).toISOString(), // Ensure valid ISO string
            server_received_utc: new Date(artifact.timestamps.server_received_utc).toISOString(), // Use artifact timestamp
            app_env: artifact.app.env,
            cid0g: cid,
            integrity_sha256: sha256,
        })
            .select("id") // Only select the ID we need for the response
            .single();
        // Handle Supabase errors
        if (error) {
            console.error("Supabase insert error in /predictions/record:", error);
            throw error; // Let the catch block handle it
        }
        if (!log) {
            // Should not happen with .single() unless insert failed silently
            console.error("Supabase insert did not return log data in /predictions/record");
            return res
                .status(500)
                .json({ error: "Failed to record prediction log" });
        }
        // Success response
        return res.status(201).json({ id: log.id, cid, sha256 }); // Use 201 Created status
    }
    catch (err) {
        console.error("Error in POST /predictions/record:", err);
        // Provide a generic error message to the client
        return res.status(500).json({
            error: "An internal server error occurred while recording the prediction.",
        });
    }
});
// GET /api/predictions/by-wager/:wagerId -> Fetches the latest prediction log for a specific wagerId
router.get("/by-wager/:wagerId", async (req, res) => {
    // Add types
    try {
        const { wagerId } = req.params; // wagerId from the URL path
        if (!wagerId) {
            return res.status(400).json({ error: "Missing wagerId parameter" });
        }
        // Fetch the latest log based on creation timestamp
        const { data: log, error } = await supabase_1.supabaseAdmin
            .from("ai_prediction_logs")
            .select(
        // Select specific fields for the response
        `
        id, wager_id, title, confidence_pct, model_provider, model_name,
        model_version, created_utc, server_received_utc, app_env, cid0g,
        integrity_sha256, created_at
      `)
            .eq("wager_id", wagerId)
            .order("created_at", { ascending: false }) // Get the most recent one
            .limit(1)
            .maybeSingle(); // Use maybeSingle to handle null gracefully if no log found
        // Handle Supabase errors (excluding 'not found', which maybeSingle handles)
        if (error) {
            console.error(`Supabase fetch error in /by-wager/${wagerId}:`, error);
            throw error;
        }
        // If no log is found for the wagerId
        if (!log) {
            return res
                .status(404)
                .json({ error: `Prediction log not found for wagerId: ${wagerId}` });
        }
        // Return the found log data, mapping DB columns to response fields if needed
        return res.status(200).json({
            log: {
                id: log.id,
                wagerId: log.wager_id,
                title: log.title,
                confidencePct: log.confidence_pct,
                modelProvider: log.model_provider,
                modelName: log.model_name,
                modelVersion: log.model_version,
                createdUtc: log.created_utc,
                serverReceivedUtc: log.server_received_utc,
                appEnv: log.app_env,
                cid0g: log.cid0g,
                integritySha256: log.integrity_sha256,
                createdAt: log.created_at,
            },
        });
    }
    catch (err) {
        console.error("Error in GET /predictions/by-wager/:wagerId:", err);
        return res
            .status(500)
            .json({ error: "An internal server error occurred." });
    }
});
// GET /api/predictions/:id -> Fetches a specific prediction log by its database ID
router.get("/:id", async (req, res) => {
    // Add types
    try {
        const idParam = req.params.id;
        const id = Number(idParam); // Convert ID from URL param to number
        // Validate that the ID is a valid number
        if (!Number.isFinite(id) || id <= 0) {
            return res
                .status(400)
                .json({ error: "Invalid prediction log ID provided." });
        }
        // Fetch the log by its primary key (id)
        const { data: log, error } = await supabase_1.supabaseAdmin
            .from("ai_prediction_logs")
            .select("*") // Select all columns for this specific log
            .eq("id", id)
            .single(); // Use single() as ID should be unique
        // Handle Supabase errors (excluding 'not found')
        if (error && error.code !== "PGRST116") {
            console.error(`Supabase fetch error for prediction ID ${id}:`, error);
            throw error;
        }
        // If no log is found for the given ID
        if (!log) {
            return res
                .status(404)
                .json({ error: `Prediction log not found with ID: ${id}` });
        }
        // Return the full log data
        return res.status(200).json({
            log: {
                id: log.id,
                wagerId: log.wager_id,
                title: log.title,
                confidencePct: log.confidence_pct,
                modelProvider: log.model_provider,
                modelName: log.model_name,
                modelVersion: log.model_version,
                createdUtc: log.created_utc,
                serverReceivedUtc: log.server_received_utc,
                appEnv: log.app_env,
                cid0g: log.cid0g,
                integritySha256: log.integrity_sha256,
                createdAt: log.created_at,
                // Include user_id if needed, ensuring it's selected above with '*'
                // userId: log.user_id
            },
        });
    }
    catch (err) {
        console.error("Error in GET /predictions/:id:", err);
        return res
            .status(500)
            .json({ error: "An internal server error occurred." });
    }
});
// GET /api/predictions/:id/artifact -> Dev helper to retrieve the locally stored artifact JSON
router.get("/:id/artifact", async (req, res) => {
    // Add types
    try {
        const idParam = req.params.id;
        const id = Number(idParam);
        if (!Number.isFinite(id) || id <= 0) {
            return res
                .status(400)
                .json({ error: "Invalid prediction log ID provided." });
        }
        // First, get the wager_id associated with this log ID
        const { data: log, error } = await supabase_1.supabaseAdmin
            .from("ai_prediction_logs")
            .select("wager_id") // Only need wager_id
            .eq("id", id)
            .single();
        if (error && error.code !== "PGRST116") {
            console.error(`Supabase fetch error for prediction ID ${id} artifact lookup:`, error);
            throw error;
        }
        if (!log || !log.wager_id) {
            return res.status(404).json({
                error: `Prediction log or associated wager_id not found for ID: ${id}`,
            });
        }
        // Construct the expected local artifact file path
        const artifactDir = process.env.ARTIFACT_DIR || ".artifacts"; // Allow configuring artifact dir
        const filePath = path_1.default.resolve(process.cwd(), // Assumes running from project root
        artifactDir, `${log.wager_id}.json` // Filename based on wager_id
        );
        // Check if the file exists locally
        if (fs_1.default.existsSync(filePath)) {
            // Read the file content
            const fileBuffer = fs_1.default.readFileSync(filePath);
            // Set the correct content type and send the file content
            res.setHeader("Content-Type", "application/json");
            return res.status(200).send(fileBuffer);
        }
        else {
            // File not found locally
            console.warn(`Local artifact not found for prediction ID ${id} at ${filePath}`);
            return res.status(404).json({
                error: "Artifact not available locally. Check configuration or use 0G CID if applicable.",
                filePath: filePath, // Optionally return expected path for debugging
            });
        }
    }
    catch (err) {
        console.error("Error in GET /predictions/:id/artifact:", err);
        return res.status(500).json({
            error: "An internal server error occurred while retrieving the artifact.",
        });
    }
});
exports.default = router;
//# sourceMappingURL=predictions.js.map