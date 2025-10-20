"use client";
import { useEffect, useMemo, useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Input } from '@/components/ui/input';

type Mode = 'sol' | 'usdc';

export default function VSCalculatorPage() {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [usdcPrice, setUsdcPrice] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('sol');
  const [marketcap, setMarketcap] = useState<number>(800_000); // default 800k
  const [received, setReceived] = useState<string>('');
  const [wallet, setWallet] = useState('');

  useEffect(() => { fetchPrices(); }, []);

  async function fetchPrices() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd');
      const data = await res.json();
      setSolPrice(Number(data?.solana?.usd)||0);
      setUsdcPrice(Number(data?.['usd-coin']?.usd)||1);
    } catch { setSolPrice(null); setUsdcPrice(null); }
  }

  const tokenPrice = useMemo(() => (marketcap*1000)/100_000_000_000, [marketcap]);
  const calc = useMemo(() => {
    const amt = Number(received||0);
    const ref = mode==='sol' ? solPrice : usdcPrice;
    if (!amt || !ref || !tokenPrice) return null;
    const vs = mode==='sol' ? (amt * ref) / tokenPrice : amt / tokenPrice;
    return vs;
  }, [received, mode, solPrice, usdcPrice, tokenPrice]);

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="$VS Calculator" />
          <div className="space-y-5">
            <div className="text-sm text-white/70">
              {solPrice!=null && usdcPrice!=null ? `SOL: $${solPrice.toFixed(2)} | USDC: $${usdcPrice.toFixed(2)}` : 'Fetching prices...'}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Calculation Mode</label>
              <select className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2" value={mode} onChange={(e)=>setMode(e.target.value as Mode)}>
                <option value="sol">Solana</option>
                <option value="usdc">USDC</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-white/80 mb-2">Marketcap</div>
              <div className="flex flex-wrap gap-2">
                {[350,600,800,1000,2000,3000,5000].map(k => (
                  <button key={k} onClick={()=>setMarketcap(k*1000)} className={`px-3 py-1 rounded border ${marketcap===k*1000? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>{k}k</button>
                ))}
              </div>
              <div className="text-sm mt-2">Price: {tokenPrice.toFixed(9)}</div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Amount Received ({mode.toUpperCase()})</label>
              <Input type="number" step="any" value={received} onChange={e=>setReceived(e.target.value)} placeholder="Enter amount" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Wallet</label>
              <Input value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="Enter wallet address" />
            </div>
            <div className="text-white/90 min-h-6">
              {calc!=null ? `Please Send: ${calc.toFixed(2)} $VS (${mode.toUpperCase()})` : ''}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
