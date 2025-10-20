"use client";
import { useEffect, useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/adminApi';

interface VenmoPayoutRow {
  id: number;
  username?: string;
  amount: number;
  source?: string;
  created_at: string;
}

export default function VenmoPayoutsPage() {
  const [rows, setRows] = useState<VenmoPayoutRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const data = await adminApi.get<VenmoPayoutRow[]>('/admin/venmo-payouts-store');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function markPaid(id: number) {
    if (!confirm(`Mark Venmo payout #${id} as paid?`)) return;
    setActionId(id);
    try {
      await adminApi.post(`/admin/mark-venmo-paid/${id}`);
      setRows(r => r.filter(x => x.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to update');
    } finally { setActionId(null); }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Venmo Payout Requests" />
          {error && (<div className="text-sm text-red-400 mb-3">{error}</div>)}
          <div className="mb-3 text-sm text-white/70">Pending Venmo payout requests</div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/70">
                  <th className="py-2">ID</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="py-2">{r.id}</td>
                    <td className="py-2">{r.username || '-'}</td>
                    <td className="py-2">${r.amount}</td>
                    <td className="py-2">{r.source || '-'}</td>
                    <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2">
                      <Button size="sm" disabled={actionId===r.id} onClick={() => markPaid(r.id)}>
                        {actionId===r.id? 'Working...' : 'Mark Paid'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!loading && rows.length===0) && (
                  <tr><td className="py-6 text-center text-white/60" colSpan={6}>No pending payouts</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
