-- Supabase Migration SQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    avatar TEXT,
    google_id TEXT UNIQUE,
    solana_public_key TEXT UNIQUE,
    provider TEXT,
    role TEXT DEFAULT 'user',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_prediction_logs table
CREATE TABLE IF NOT EXISTS ai_prediction_logs (
    id SERIAL PRIMARY KEY,
    wager_id TEXT NOT NULL,
    title TEXT NOT NULL,
    confidence_pct DECIMAL(5,2),
    model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT,
    created_utc TIMESTAMPTZ NOT NULL,
    server_received_utc TIMESTAMPTZ NOT NULL,
    app_env TEXT NOT NULL,
    cid0g TEXT,
    integrity_sha256 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_solana_public_key ON users(solana_public_key);
CREATE INDEX IF NOT EXISTS idx_ai_prediction_logs_wager_id ON ai_prediction_logs(wager_id);
CREATE INDEX IF NOT EXISTS idx_ai_prediction_logs_user_id ON ai_prediction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prediction_logs_created_at ON ai_prediction_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prediction_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for ai_prediction_logs table
-- Users can read their own prediction logs
CREATE POLICY "Users can read own prediction logs" ON ai_prediction_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own prediction logs
CREATE POLICY "Users can insert own prediction logs" ON ai_prediction_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (optional)
-- You can uncomment and modify this if you want a default admin user
-- INSERT INTO users (id, email, name, role) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User', 'admin')
-- ON CONFLICT (email) DO NOTHING;
