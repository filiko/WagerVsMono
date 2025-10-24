export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string | null;
                    name: string | null;
                    avatar: string | null;
                    google_id: string | null;
                    solana_public_key: string | null;
                    provider: string | null;
                    role: string;
                    last_login: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email?: string | null;
                    name?: string | null;
                    avatar?: string | null;
                    google_id?: string | null;
                    solana_public_key?: string | null;
                    provider?: string | null;
                    role?: string;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    name?: string | null;
                    avatar?: string | null;
                    google_id?: string | null;
                    solana_public_key?: string | null;
                    provider?: string | null;
                    role?: string;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            ai_prediction_logs: {
                Row: {
                    id: number;
                    wager_id: string;
                    title: string;
                    confidence_pct: number | null;
                    model_provider: string;
                    model_name: string;
                    model_version: string | null;
                    created_utc: string;
                    server_received_utc: string;
                    app_env: string;
                    cid0g: string | null;
                    integrity_sha256: string | null;
                    created_at: string;
                    user_id: string | null;
                };
                Insert: {
                    id?: number;
                    wager_id: string;
                    title: string;
                    confidence_pct?: number | null;
                    model_provider: string;
                    model_name: string;
                    model_version?: string | null;
                    created_utc: string;
                    server_received_utc: string;
                    app_env: string;
                    cid0g?: string | null;
                    integrity_sha256?: string | null;
                    created_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    id?: number;
                    wager_id?: string;
                    title?: string;
                    confidence_pct?: number | null;
                    model_provider?: string;
                    model_name?: string;
                    model_version?: string | null;
                    created_utc?: string;
                    server_received_utc?: string;
                    app_env?: string;
                    cid0g?: string | null;
                    integrity_sha256?: string | null;
                    created_at?: string;
                    user_id?: string | null;
                };
            };
        };
    };
};
//# sourceMappingURL=supabase.d.ts.map