# Wager Backend

A TypeScript Express backend with Google OAuth authentication, Prisma ORM, and MySQL database.

## Features

- Google OAuth authentication
- JWT token-based authentication
- TypeScript support
- Prisma ORM with MySQL
- CORS enabled for frontend integration
- Cookie-based session management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with:
```
PORT=5000
DATABASE_URL="mysql://DB_USER:DB_PASS@DB_HOST:3306/DB_NAME"
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Protected Routes
- `GET /api/profile` - Get user profile (requires authentication)

### Health Check
- `GET /api/health` - Server health check

### AI Predictions (0G Artifacts)
- `POST /api/predictions/record` (internal)
  - Body: `{ wagerId, title, confidencePct?, model:{ provider, name, version? }, createdUtc }`
  - Writes a canonical JSON artifact to 0G (or local stub), returns `{ id, cid, sha256 }`, and stores `cid0g` + `integritySha256` in DB.
  - Protect with header `X-Internal-Key: $PREDICTION_INTERNAL_KEY`.

## Development

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio

## Database

The application uses Prisma ORM with MySQL. The User model includes:

### AiPredictionLog
Immutable record of an AI prediction with a pointer to 0G storage.
- Fields: `wagerId`, `title`, `confidencePct?`, `modelProvider`, `modelName`, `modelVersion?`, `createdUtc`, `serverReceivedUtc`, `appEnv`, `cid0g?`, `integritySha256?`.
- Populated by `/api/predictions/record` after uploading the artifact to 0G.

### 0G Configuration
Set these in `.env`:
- `ZEROG_ENDPOINT` and `ZEROG_KEY` for real uploads (SDK integration TBD).
- `APP_ENV` tag embedded in artifacts (default `prod`).
- `PREDICTION_INTERNAL_KEY` to guard internal endpoints.
- Google OAuth integration
- User profile information
- Role-based access control
- Login tracking
