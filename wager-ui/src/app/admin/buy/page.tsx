"use client";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Input } from "@/components/ui/input";

export default function BuyVSPage() {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState<string>("0");
  const [payToken, setPayToken] = useState<"SOL" | "USDC">("SOL");
  const [vsRate, setVsRate] = useState<number>(0); // derived from SOL/USDC price and hypothetical token price? Keep same as VS calculator

  useEffect(() => {
    fetchPrice();
  }, []);
  async function fetchPrice() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await res.json();
      setSolPrice(Number(data?.solana?.usd) || 0);
    } catch {
      setSolPrice(null);
    }
  }

  const converted = useMemo(() => {
    const amt = Number(payAmount || 0);
    if (payToken === "SOL") {
      if (!solPrice) return 0;
      return amt * solPrice;
    }
    return amt; // USDC
  }, [payAmount, payToken, solPrice]);

  function switchTokens() {
    setPayToken((t) => (t === "SOL" ? "USDC" : "SOL"));
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Crypto Swap (Preview)" />
          <div className="text-sm text-white/70 mb-3">
            {solPrice != null
              ? `1 SOL ≈ $${solPrice.toFixed(2)} USD`
              : "Loading SOL price..."}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Pay Amount
              </label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded border ${
                  payToken === "SOL" ? "bg-white/10" : "bg-white/5"
                } border-white/10`}
                onClick={() => setPayToken("SOL")}
              >
                SOL
              </button>
              <button
                className={`px-3 py-1 rounded border ${
                  payToken === "USDC" ? "bg-white/10" : "bg-white/5"
                } border-white/10`}
                onClick={() => setPayToken("USDC")}
              >
                USDC
              </button>
              <button
                className="ml-auto px-3 py-1 rounded border bg-white/5 border-white/10"
                onClick={switchTokens}
              >
                Switch
              </button>
            </div>
            <div className="text-sm">
              USD Equivalent: ${converted.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
