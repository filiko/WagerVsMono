"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AiDraft = {
  name: string;
  description?: string;
  left_button?: string;
  right_button?: string;
  category_key?: string;
  confidence?: number;
  reason?: string;
  lock_at_suggested?: string;
  expires_at_suggested?: string;
  logId?: number;
};

export function AiWagerGenerator({
  onApply,
  initialDescription = "",
}: {
  onApply: (d: {
    title: string;
    left: string;
    right: string;
    description?: string;
    categoryKey?: string;
    confidence?: number;
    reason?: string;
    lockAt?: string;
    expiresAt?: string;
    logId?: number;
  }) => void;
  initialDescription?: string;
}) {
  const [desc, setDesc] = useState(initialDescription);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AiDraft | null>(null);
  const [hasAuth, setHasAuth] = useState(false);

  const timezoneOffset = useMemo(() => {
    const tzMinutes = new Date().getTimezoneOffset();
    const hours = -tzMinutes / 60;
    return `UTC${hours >= 0 ? `+${hours}` : hours}`;
  }, []);

  React.useEffect(() => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setHasAuth(!!token);
    } catch {
      setHasAuth(false);
    }
  }, []);

  async function generate() {
    setBusy(true);
    setError(null);
    setDraft(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/generate-wager`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ description: desc, timezoneOffset }),
      });
      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : await res.text();
      if (!res.ok)
        throw new Error(
          (payload && (payload.error || payload.message)) ||
            `Request failed: ${res.status}`
        );
      setDraft(payload as AiDraft);
    } catch (e: any) {
      setError(
        e?.message || "AI generation unavailable. Ask an admin to enable it."
      );
    } finally {
      setBusy(false);
    }
  }

  async function rate(rating: 1 | -1) {
    if (!draft?.logId) return;
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      await fetch(`/api/admin/rate-ai-generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ logId: draft.logId, rating }),
      });
    } catch {}
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium">AI Wager Generator</h3>
        <span className="text-xs text-white/50">Experimental</span>
      </div>

      <label className="block text-sm text-white/70 mb-2">
        Event description
      </label>
      <textarea
        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-24"
        placeholder="e.g., Lakers vs Suns this Friday. Who wins?"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <div className="mt-3 flex items-center gap-3">
        <Button onClick={generate} disabled={busy || !desc.trim() || !hasAuth}>
          {busy ? "Generating..." : "Generate with AI"}
        </Button>
        <span className="text-xs text-white/50">{timezoneOffset}</span>
      </div>

      {!hasAuth && (
        <div className="mt-2 text-xs text-white/60">
          Admin login required to use AI. Visit /admin/login.
        </div>
      )}

      {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

      {draft && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Suggested Title</div>
              <div className="text-base font-medium">{draft.name}</div>
            </div>
            {typeof draft.confidence === "number" && (
              <div className="text-xs px-2 py-1 rounded bg-white/10">
                Confidence: {draft.confidence}%
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-white/70">Left</div>
              <Input value={draft.left_button || ""} readOnly />
            </div>
            <div>
              <div className="text-sm text-white/70">Right</div>
              <Input value={draft.right_button || ""} readOnly />
            </div>
          </div>

          {draft.description && (
            <div className="mt-3">
              <div className="text-sm text-white/70 mb-1">Description</div>
              <div className="text-sm text-white/90 whitespace-pre-wrap">
                {draft.description}
              </div>
            </div>
          )}

          {draft.reason && (
            <div className="mt-3">
              <div className="text-sm text-white/70 mb-1">Reason</div>
              <div className="text-sm text-white/90 whitespace-pre-wrap">
                {draft.reason}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
            {draft.category_key && (
              <span className="px-2 py-1 rounded bg-white/10">
                Category: {draft.category_key}
              </span>
            )}
            {draft.lock_at_suggested && (
              <span className="px-2 py-1 rounded bg-white/10">
                Lock: {draft.lock_at_suggested}
              </span>
            )}
            {draft.expires_at_suggested && (
              <span className="px-2 py-1 rounded bg-white/10">
                Expires: {draft.expires_at_suggested}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={() =>
                onApply({
                  title: draft.name,
                  left: draft.left_button || "",
                  right: draft.right_button || "",
                  description: draft.description,
                  categoryKey: draft.category_key,
                  confidence: draft.confidence,
                  reason: draft.reason,
                  lockAt: draft.lock_at_suggested,
                  expiresAt: draft.expires_at_suggested,
                  logId: draft.logId,
                })
              }
            >
              Apply to form
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10"
              onClick={() => setDraft(null)}
            >
              Discard
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <button
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                onClick={() => rate(1)}
                title="Helpful"
              >
                👍
              </button>
              <button
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                onClick={() => rate(-1)}
                title="Not helpful"
              >
                👎
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiWagerGenerator;
