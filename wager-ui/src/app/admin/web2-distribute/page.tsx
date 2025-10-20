"use client";
import { useEffect, useMemo, useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/adminApi';

interface Campaign { campaign_id: string; name: string }
interface SummaryRow { wallet_id: string; total_amount: number }

export default function Web2DistributePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [candidates, setCandidates] = useState<{ left?: string; right?: string }>({});
  const [winner, setWinner] = useState('');
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const log = (s: string) => setLogs((x) => [...x, s]);

  useEffect(() => { (async () => { try { const data = await adminApi.get<any[]>(`/allcampaigns`); setCampaigns(data||[]); } catch {} })(); }, []);

  useEffect(() => { (async () => {
    setCandidates({}); setWinner(''); setSummary([]);
    if (!campaignId) return;
    try {
      const res = await adminApi.get<any>(`/web2/distribution-candidates?campaign_id=${campaignId}`);
      setCandidates({ left: res?.left_button, right: res?.right_button });
    } catch {}
  })(); }, [campaignId]);

  async function runSummary() {
    if (!campaignId || !winner) return;
    setError(''); setSummary([]);
    try {
      const data = await adminApi.get<any>(`/web2/distribution-summary?campaign_id=${campaignId}&winning_candidate=${encodeURIComponent(winner)}`);
      if (!Array.isArray(data)) throw new Error('Invalid data');
      setSummary(data as SummaryRow[]);
    } catch (e: any) { setError(e?.message||'Failed to fetch distribution results'); }
  }

  async function sendDistributions() {
    if (!campaignId || !winner || summary.length===0) return;
    setBusy(true); setLogs([]);
    try {
      for (const row of summary) {
        const full = Number(row.total_amount)||0;
        const winnerAmt = (full * 0.99).toFixed(2);
        const bankAmt = (full * 0.01).toFixed(2);
        try {
          await adminApi.post(`/web2/distribute-vschips`, { wallet_id: row.wallet_id, amount: winnerAmt, campaign_id: campaignId, winning_candidate: winner });
          const bankWallet = 'Web2Wallet_Bank4VSChips';
          await adminApi.post(`/web2/distribute-vschips`, { wallet_id: bankWallet, amount: bankAmt, campaign_id: campaignId, winning_candidate: 'bank' });
          log(`${row.wallet_id} received ${winnerAmt} VSChips (1%=${bankAmt} to bank)`);
        } catch (e: any) {
          log(`Error: ${row.wallet_id} failed: ${e?.message || 'unknown error'}`);
        }
      }
    } finally { setBusy(false); }
  }

  const hasSummary = summary.length>0;

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Web2 Distribution" />
          {error && (<div className="text-sm text-red-400 mb-3">{error}</div>)}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Select Campaign</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={campaignId} onChange={(e)=>setCampaignId(e.target.value)}>
                <option value="">Select a campaign</option>
                {campaigns.map(c => (<option key={c.campaign_id} value={c.campaign_id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Select Winning Candidate</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={winner} onChange={(e)=>setWinner(e.target.value)}>
                <option value="">Select winner</option>
                {candidates.left && (<option value={candidates.left}>{candidates.left}</option>)}
                {candidates.right && (<option value={candidates.right}>{candidates.right}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={runSummary} disabled={!campaignId || !winner}>Calculate Payouts</Button>
              <Button onClick={sendDistributions} disabled={!campaignId || !winner || !hasSummary || busy}>{busy? 'Sending...' : 'Send VSChips to Winners'}</Button>
            </div>
            {hasSummary && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-semibold mb-2">Results</div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/70">
                        <th className="py-2">Wallet</th>
                        <th className="py-2">Total Payout (VSChips)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((r,i)=> (
                        <tr key={i} className="border-t border-white/10">
                          <td className="py-2">{r.wallet_id}</td>
                          <td className="py-2">{Number(r.total_amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {logs.length>0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-semibold mb-2">Status</div>
                <div className="space-y-1 text-sm" dangerouslySetInnerHTML={{ __html: logs.join('<br/>') }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
