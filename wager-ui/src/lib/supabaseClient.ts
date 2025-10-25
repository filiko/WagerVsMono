import { createClient } from "@supabase/supabase-js";

// 1. PUBLIC keys MUST start with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2. SERVER keys must NOT start with NEXT_PUBLIC_
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for user operations (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (API routes)
// This uses the SERVICE_ROLE_KEY to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// You can copy your database types from the old supabase.js here if you want TS safety
export type Database = {
  // ... (copy types from wager-backend/src/lib/supabase.js) ...
};
