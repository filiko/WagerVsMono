"use client";
import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";

export default function ExternalPointsPage() {
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [eventType, setEventType] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setStatus(null);
    if (!walletId || !amount || !reason || !eventType) {
      setStatus({ ok: false, msg: "All fields are required." });
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.post("/add-external-points", {
        wallet_id: walletId,
        amount: Number(amount),
        event_type: eventType,
        description: reason,
      });
      setStatus({ ok: true, msg: (res?.message as string) || "Points added successfully" });
      setWalletId(""); setAmount(""); setEventType(""); setReason("");
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Add External Points" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Wallet ID</label>
              <Input value={walletId} onChange={(e) => setWalletId(e.target.value)} placeholder="Wallet ID" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Points Amount</label>
              <Input type="number" value={amount as any} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Points" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Event Type</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="">Select Event Type</option>
                <option value="twitter">Twitter (X)</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Reason / Description</label>
              <textarea className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-28" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason"></textarea>
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">{loading ? "Submitting..." : "Submit"}</Button>
            {status && (
              <div className={"text-center text-sm " + (status.ok ? "text-emerald-400" : "text-red-400")}>{status.msg}</div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}