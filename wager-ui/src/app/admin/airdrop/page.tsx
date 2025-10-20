"use client";
import { useEffect, useMemo, useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/adminApi';

interface AirdropRow { walletID: string; xPoints: number }

export default function AirdropPage() {
  const [rows, setRows] = useState<AirdropRow[]>([]);
  const [multiplier, setMultiplier] = useState<number>(1000);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { const data = await adminApi.get<AirdropRow[]>(`/airdropUsers`); setRows(Array.isArray(data)? data: []); }
      catch (e: any) { setError(e?.message || 'Failed to load'); }
    })();
  }, []);

  const computed = useMemo(() => rows.map(r => ({ ...r, vs: (Number(r.xPoints)||0) * (Number(multiplier)||0) })), [rows, multiplier]);

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Airdrop Summary" />
          {error && (<div className="text-sm text-red-400 mb-3">{error}</div>)}
          <div className="mb-4">
            <label className="block text-sm text-white/70 mb-2">Set Multiplier</label>
            <div className="max-w-xs"><Input type="number" value={multiplier as any} onChange={(e)=>setMultiplier(Number(e.target.value||0))} /></div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/70">
                  <th className="py-2">Wallet ID</th>
                  <th className="py-2">xPoints</th>
                  <th className="py-2">$VS Airdrop</th>
                </tr>
              </thead>
              <tbody>
                {computed.map((r,i)=> (
                  <tr key={i} className="border-t border-white/10">
                    <td className="py-2">{r.walletID}</td>
                    <td className="py-2">{Number(r.xPoints).toLocaleString()}</td>
                    <td className="py-2">{Number(r.vs).toLocaleString()} $VS</td>
                  </tr>
                ))}
                {rows.length===0 && (
                  <tr><td className="py-6 text-center text-white/60" colSpan={3}>No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
