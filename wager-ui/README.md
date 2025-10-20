# Wager UI - Frontend Application

A Next.js 15 application for the Wager platform with Google OAuth and Solana wallet integration.

## Features

- Next.js 15 with React 19
- TypeScript support
- Google OAuth authentication
- Solana wallet integration
- Tailwind CSS styling
- Radix UI components

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- Running backend server (see wager-backend README)

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Set Up Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```
# For local development (connecting to local backend):
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Note**: Make sure your backend is running on port 5000 before starting the frontend.

### Step 3: Start the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The page auto-updates as you edit files in `src/app/`.

## Building for Production

```bash
npm run build
npm run start
```

## Environment Configuration

### Local Development
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production/Test Server
Update `.env.local` with production backend URL:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Integration with Backend

This frontend connects to the wager-backend API. Ensure:
1. The backend is running and accessible
2. `NEXT_PUBLIC_API_URL` points to the correct backend URL
3. CORS is properly configured in the backend for your frontend URL
4. Google OAuth credentials match between frontend and backend

## Deployment

The frontend can be deployed independently to:
- Vercel (recommended for Next.js)
- Any Node.js hosting platform
- Static hosting (after `npm run build`)

Make sure to set environment variables in your deployment platform.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
