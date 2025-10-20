"use client";
import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Connection, PublicKey } from '@solana/web3.js';

type Cluster = 'mainnet' | 'devnet' | 'testnet';

export default function GetBalancePage() {
  const [wallet, setWallet] = useState('');
  const [cluster, setCluster] = useState<Cluster>('mainnet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  function rpcUrl(c: Cluster) {
    switch (c) {
      case 'devnet': return 'https://api.devnet.solana.com';
      case 'testnet': return 'https://api.testnet.solana.com';
      default: return 'https://api.mainnet-beta.solana.com';
    }
  }

  async function getBalance() {
    setError(''); setBalance(null); setLoading(true);
    try {
      const conn = new Connection(rpcUrl(cluster), 'confirmed');
      const pub = new PublicKey(wallet);
      const lamports = await conn.getBalance(pub);
      setBalance(lamports / 1e9);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch balance');
    } finally { setLoading(false); }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Get Wallet Balance" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Wallet Address</label>
              <Input value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="Solana wallet address" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Cluster</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={cluster} onChange={(e)=>setCluster(e.target.value as Cluster)}>
                <option value="mainnet">Mainnet</option>
                <option value="devnet">Devnet</option>
                <option value="testnet">Testnet</option>
              </select>
            </div>
            <Button onClick={getBalance} disabled={loading || !wallet}>{loading? 'Fetching...' : 'Get Balance'}</Button>
            {error && (<div className="text-sm text-red-400">{error}</div>)}
            {balance!=null && (<div className="text-sm">Balance: {balance.toLocaleString()} SOL</div>)}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
