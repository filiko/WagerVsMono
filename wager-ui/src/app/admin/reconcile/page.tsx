"use client";
import { useEffect, useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/adminApi';

interface ReconRow { wallet: string; recorded: number|string; computed: number|string; discrepancy: number|string }

export default function ReconcilePage() {
  const [rows, setRows] = useState<ReconRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await adminApi.get<any>(`/admin/reconciliation-list`);
      if (res?.success && Array.isArray(res.wallets)) setRows(res.wallets);
      else throw new Error('Failed to load reconciliation data');
    } catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function fixWallet(row: ReconRow) {
    const discrepancy = Number(String(row.discrepancy).replace(/,/g, ''));
    let note = '';
    if (discrepancy < 0) {
      note = prompt(`Enter reason for fixing negative discrepancy for:\n${row.wallet}`) || '';
      if (!note) return alert('Fix canceled. Admin note is required.');
    } else {
      const ok = confirm(`Fix balance for ${row.wallet}?`);
      if (!ok) return;
    }
    try {
      const data = await adminApi.post<any>(`/admin/reconcile/${row.wallet}`, { note });
      if (data?.success) {
        setRows(prev => prev.map(r => r.wallet===row.wallet ? { ...r, discrepancy: 0 } : r));
        alert(`${row.wallet} fixed.`);
      } else {
        alert('Fix failed: ' + (data?.error || 'unknown error'));
      }
    } catch (e: any) {
      alert(e?.message || 'Server error during fix');
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Web2 VSChips Reconciliation" />
          {error && (<div className="text-sm text-red-400 mb-3">{error}</div>)}
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/70">
                  <th className="py-2">Wallet</th>
                  <th className="py-2">Recorded Balance</th>
                  <th className="py-2">Computed from Transactions</th>
                  <th className="py-2">Discrepancy</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>{
                  const disc = Number(String(r.discrepancy).replace(/,/g, ''));
                  const isFixed = disc === 0;
                  return (
                    <tr key={i} className="border-t border-white/10">
                      <td className="py-2">{r.wallet}</td>
                      <td className="py-2">{Number(r.recorded).toLocaleString()}</td>
                      <td className="py-2">{Number(r.computed).toLocaleString()}</td>
                      <td className={`py-2 ${isFixed? 'text-emerald-400' : 'text-red-400'}`}>{disc.toLocaleString()}</td>
                      <td className="py-2"><Button size="sm" disabled={isFixed} onClick={()=>fixWallet(r)}>{isFixed? 'OK' : 'Fix It'}</Button></td>
                    </tr>
                  );
                })}
                {(!loading && rows.length===0) && (<tr><td className="py-6 text-center text-white/60" colSpan={5}>No rows</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
