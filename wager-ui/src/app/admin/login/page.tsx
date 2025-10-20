"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token) {
        throw new Error(data?.error || "Login failed");
      }
      try { localStorage.setItem("token", data.token); } catch {}
      const next = (params?.get("next") as string | null) || "/admin/dashboard";
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">Admin Login</h1>
        <p className="text-sm text-zinc-400 mb-6">Temporary dev access. Any credentials accepted.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          {error && (<div className="text-sm text-red-400">{error}</div>)}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
