# 0G AI Prediction Artifact Implementation

This document records how AI predictions are persisted as immutable artifacts while keeping Prisma/SQLite as the transactional core. The hot path (balances, wagers, settles) remains in the DB; 0G stores verifiable artifacts for audit.

## Overview
- Immutable store: 0G holds canonical JSON artifacts of predictions (what, when, model).
- System of record: DB remains authoritative for state transitions and money.
- Dev fallback: local stub writes artifacts to `.artifacts/` and returns a pseudo-CID.

## Data Model
- File: `wager-backend/prisma/schema.prisma`
- Added model: `AiPredictionLog`
  - Fields: `wagerId`, `title`, `confidencePct?`, `modelProvider`, `modelName`, `modelVersion?`, `createdUtc`, `serverReceivedUtc`, `appEnv`, `cid0g?`, `integritySha256?`, `createdAt`.
- Migration: `wager-backend/prisma/migrations/20251017120000_add_ai_prediction_log/migration.sql`

Run:
- `cd wager-backend`
- `npm run prisma:generate && npm run prisma:migrate`

## Environment
- File: `wager-backend/.env.example`
- Vars:
  - `APP_ENV=prod` (tag embedded in artifacts)
  - `PREDICTION_INTERNAL_KEY` (protect internal record endpoint)
  - `ZEROG_ENDPOINT`, `ZEROG_KEY` (used when switching from stub to real SDK)

## Service (Artifact Builder + Uploader)
- File: `wager-backend/src/services/zeroG.ts`
- Functions:
  - `buildPredictionArtifact(input)`: constructs canonical JSON and `integrity.sha256`.
  - `uploadToZeroG(bytes)`: stub that writes to `.artifacts/` and returns a deterministic pseudo-CID.
  - `recordPredictionTo0G(input)`: builds → uploads → returns `{ cid, sha256, artifact }`.
- Canonical JSON includes: `wager_id`, `prediction{title,confidence_pct}`, `model{provider,name,version}`, `timestamps{created_utc,server_received_utc}`, `app{env,wager_side_mapping}`, `integrity{sha256}`.

## API Endpoints
- Mount: `wager-backend/src/index.ts` → `app.use('/api/predictions', predictionsRoutes)`
- File: `wager-backend/src/routes/predictions.ts`
  - `POST /api/predictions/record` (internal)
    - Body: `{ wagerId, title, confidencePct?, model:{provider,name,version?}, createdUtc }`
    - Header: `X-Internal-Key: $PREDICTION_INTERNAL_KEY` (optional in dev)
    - Effect: uploads artifact to 0G/stub and persists `cid0g`, `integritySha256` in `AiPredictionLog`.
    - Response: `{ id, cid, sha256 }`
  - `GET /api/predictions/by-wager/:wagerId`: latest log by `wagerId`.
  - `GET /api/predictions/:id`: single log by id.
  - `GET /api/predictions/:id/artifact`: dev helper returning local `.artifacts/<wagerId>.json`.
- Admin stub integration: `wager-backend/src/routes/admin.ts`
  - `POST /api/admin/generate-wager`: produces a draft and records a 0G artifact; returns `logId`.

## UI Integration
- File: `wager-ui/src/app/prediction/[id]/page.tsx`
  - Fetches `GET /api/predictions/by-wager/:id`.
  - Displays “Verified on 0G” badge when `cid0g` is present and a “View artifact” link.
- Rewrites: `wager-ui/next.config.ts` proxies `/api/*` to backend.

### Admin Portal
- Page: `wager-ui/src/app/admin/ai-logs/page.tsx`
  - Search by `wagerId` (or numeric log id) to inspect a record.
  - Shows CID and integrity hash, with a button to open the local dev artifact.
  - Linked from Admin Dashboard as “AI Logs”.

## Local Dev Flow
1) Configure `.env` in `wager-backend/`:
   - `APP_ENV=prod`, optionally `PREDICTION_INTERNAL_KEY=dev-internal-key`.
2) Migrate Prisma: `npm run prisma:generate && npm run prisma:migrate`.
3) Start services:
   - Backend: `npm run dev`
   - UI: `cd wager-ui && npm i && npm run dev`
4) Generate an AI draft (admin): `POST /api/admin/login` → `POST /api/admin/generate-wager`.
5) Inspect `.artifacts/<wagerId>.json` and DB row in `AiPredictionLog`.
6) UI shows badge on `/prediction/[wagerId]` if a log exists.

### Local Hash Test
- Verify an artifact’s integrity locally:
  - `cd wager-backend`
  - `npm run verify:artifact -- .artifacts/<wagerId>.json`
  - Or just: `npm run verify:artifact -- <wagerId>` (looks in `.artifacts/`)
- Output shows:
  - Embedded `integrity.sha256`
  - Recomputed sha256 over the artifact without the `integrity` field
  - Dev pseudo-CID (derived from full artifact bytes) for comparison
  - Status: VERIFIED/FAILED

## Production Switch to Real 0G
- Install: `npm i @0glabs/0g-ts-sdk`.
- Replace stub in `uploadToZeroG` with SDK client using `ZEROG_ENDPOINT` + `ZEROG_KEY`.
- Keep `recordPredictionTo0G` and DB wiring as-is.

## Security & Privacy
- Never commit secrets; use `.env`.
- Guard internal endpoints with `PREDICTION_INTERNAL_KEY`.
- If inputs are sensitive, encrypt or redact before upload, or store hashes only.

## Notes
- Pseudo-CID is for dev only; production requires real 0G storage.
- If Prisma types lag, run `npm run prisma:generate` (code uses `(prisma as any)` to avoid blocking).
