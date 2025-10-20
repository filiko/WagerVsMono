"use client";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";

export default function DistributePage() {
  const [campaigns, setCampaigns] = useState<
    Array<{ campaign_id: string; name: string }>
  >([]);
  const [campaignId, setCampaignId] = useState("");
  const [totals, setTotals] = useState<any | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [walletWagers, setWalletWagers] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const log = (s: string) => setLogs((x) => [...x, s]);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.get<any[]>("/allcampaigns");
        setCampaigns(data || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!campaignId) {
      setTotals(null);
      setWinner(null);
    } else {
      loadTotals();
    }
  }, [campaignId]);

  async function loadTotals() {
    try {
      const data = await adminApi.get(
        `/campaignTotals?campaign_id=${campaignId}`
      );
      setTotals(data);
      const l = Number(data.leftTotal || 0),
        r = Number(data.rightTotal || 0);
      setWinner(l > r ? data.leftButton : r > l ? data.rightButton : null);
    } catch {}
  }

  const left = useMemo(
    () => ({
      vschips: Number(totals?.web2leftTotal || 0),
      vs: Number(totals?.web3leftTotal || 0),
      label: totals?.leftButton,
    }),
    [totals]
  );
  const right = useMemo(
    () => ({
      vschips: Number(totals?.web2rightTotal || 0),
      vs: Number(totals?.web3rightTotal || 0),
      label: totals?.rightButton,
    }),
    [totals]
  );

  const total = useMemo(
    () => ({
      vschips: left.vschips + right.vschips,
      vs: left.vs + right.vs,
    }),
    [left, right]
  );

  async function toggleWagerDetails() {
    setDetailsOpen((x) => !x);
    if (!detailsOpen && campaignId) {
      try {
        const data = await adminApi.get(
          `/walletWagers?campaign_id=${campaignId}`
        );
        setWalletWagers(Array.isArray(data) ? data : []);
      } catch {}
    }
  }

  async function markCampaignDone() {
    if (!campaignId || !winner) return;
    setBusy(true);
    setLogs([]);
    try {
      log("Checking winner side...");
      const winningSide =
        winner === left.label
          ? "left"
          : winner === right.label
          ? "right"
          : "draw";

      log("Transferring SOL to both wallets...");
      await adminApi.post("/send-sol", {
        campaign_id: campaignId,
        winner,
        winning_side: winningSide,
        sender_side: "left",
      });
      await adminApi.post("/send-sol", {
        campaign_id: campaignId,
        winner,
        winning_side: winningSide,
        sender_side: "right",
      });

      if (winningSide !== "draw") {
        log("Distributing tokens to winners...");
        await adminApi.post("/transfer-winner-to-winners", {
          campaign_id: campaignId,
          winner,
          winning_side: winningSide,
        });
      } else {
        log("Processing draw distributions...");
        await adminApi.post("/draw/send-vs", { campaign_id: campaignId });
      }

      log("Done.");
    } catch (e: any) {
      log(`Error: ${e?.message || "Operation failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Distribution Overview" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Select Campaign
              </label>
              <select
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">Select a Campaign</option>
                {campaigns.map((c) => (
                  <option key={c.campaign_id} value={c.campaign_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {totals && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-white/60">{left.label}</div>
                    <div className="text-sm">
                      {left.vschips.toLocaleString()} $VSCHIPS
                    </div>
                    <div className="text-sm">
                      {left.vs.toLocaleString()} $VS
                    </div>
                    <div className="text-lg font-semibold">
                      {left.vs.toLocaleString()} $VS total
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="winner"
                        checked={winner === left.label}
                        onChange={() => setWinner(left.label!)}
                      />{" "}
                      Winner
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/60">{right.label}</div>
                    <div className="text-sm">
                      {right.vschips.toLocaleString()} $VSCHIPS
                    </div>
                    <div className="text-sm">
                      {right.vs.toLocaleString()} $VS
                    </div>
                    <div className="text-lg font-semibold">
                      {right.vs.toLocaleString()} $VS total
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="winner"
                        checked={winner === right.label}
                        onChange={() => setWinner(right.label!)}
                      />{" "}
                      Winner
                    </label>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  Total Pool: {total.vschips.toLocaleString()} $VSCHIPS,{" "}
                  {total.vs.toLocaleString()} $VS
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={toggleWagerDetails}
                disabled={!campaignId}
              >
                {detailsOpen ? "Hide" : "Wager Details"}
              </Button>
              <Button
                onClick={markCampaignDone}
                disabled={!campaignId || !winner || busy}
              >
                {busy ? "Processing..." : "Campaign Done"}
              </Button>
            </div>

            {detailsOpen && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-semibold mb-2">Wager Details</div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/70">
                        <th className="py-2">Wallet</th>
                        <th className="py-2">Candidate</th>
                        <th className="py-2">Waged</th>
                        <th className="py-2">Winnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletWagers.map((w, i) => (
                        <tr key={i} className="border-t border-white/10">
                          <td className="py-2">{w.wallet}</td>
                          <td className="py-2">{w.candidate}</td>
                          <td className="py-2">{w.waged}</td>
                          <td className="py-2">{w.winnings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-semibold mb-2">Logs</div>
                <div
                  className="space-y-1 text-sm"
                  dangerouslySetInnerHTML={{ __html: logs.join("<br/>") }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
