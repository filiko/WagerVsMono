"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";

export default function RefundPage() {
  const [campaigns, setCampaigns] = useState<Array<{ campaign_id: string; name: string }>>([]);
  const [campaignId, setCampaignId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [sourceMnemonic, setSourceMnemonic] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; lines: string[] }>({ open: false, lines: [] });

  useEffect(() => {
    (async () => {
      try { const data = await adminApi.get<any[]>("/allcampaigns"); setCampaigns(data || []); } catch {}
    })();
  }, []);

  function openModal() { setModal({ open: true, lines: [] }); }
  function log(line: string) { setModal(m => ({ open: true, lines: [...m.lines, line] })); }
  function closeModal() { setModal({ open: false, lines: [] }); }

  function isValidMnemonic(m: string) {
    const words = m.trim().split(/\s+/).filter(Boolean);
    return words.length >= 12 && words.length <= 24 && words.length % 3 === 0;
  }

  async function sendRefund() {
    if (!campaignId || !recipient || !amount || !sourceMnemonic) return;
    if (!isValidMnemonic(sourceMnemonic)) {
      setModal({ open: true, lines: ["Invalid mnemonic provided. Expected 12–24 words (multiple of 3)."] });
      return;
    }
    openModal();
    log("Sending refund...");
    setLoading(true);
    try {
      const seed = sourceMnemonic.trim();
      const res = await adminApi.post("/send-refund", { campaign_id: campaignId, recipient, amount: Number(amount), sourceWallet: seed, mnemonic: seed, sourcePrivateKey: seed });
      const tx = (res as any)?.transaction_hash;
      if (tx) log(`Refund sent. TX: <a target="_blank" href="https://explorer.solana.com/tx/${tx}?cluster=mainnet">${tx}</a>`);
      else log("Refund sent.");
    } catch (e: any) {
      log(`Error: ${e?.message || "Refund failed"}`);
    } finally { setLoading(false); }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Issue Refund" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Campaign</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
                <option value="">Select a Campaign</option>
                {campaigns.map(c => (<option key={c.campaign_id} value={c.campaign_id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Recipient Wallet</label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Solana wallet address" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Amount ($VS)</label>
              <Input type="number" value={amount as any} onChange={(e) => setAmount(e.target.value===""?"":Number(e.target.value))} placeholder="Amount" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Source Mnemonic (12–24 words)</label>
              <Input value={sourceMnemonic} onChange={(e) => setSourceMnemonic(e.target.value)} placeholder="twelve or twenty-four word seed phrase" />
            </div>
            <Button onClick={sendRefund} disabled={loading || !campaignId || !recipient || !amount || !sourceMnemonic} className="w-full">{loading?"Sending...":"Send Refund"}</Button>
          </div>
        </div>
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-xl rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-2">Don't Refresh the Page</h2>
              <div className="max-h-[50vh] overflow-auto space-y-1 text-sm" dangerouslySetInnerHTML={{__html: modal.lines.join('<br/>')}} />
              <div className="mt-4 text-right">
                <Button onClick={closeModal}>OK</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
