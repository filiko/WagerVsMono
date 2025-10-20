"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CreatePredictionModal } from "@/components/modals/CreatePredictionModal";
import { BuyTokensModal } from "@/components/modals/BuyTokensModal";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export function Sidebar() {
  const [open, setOpen] = React.useState(false);
  const [buyTokensOpen, setBuyTokensOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const pathname = usePathname();
  const { walletInfo, loading, refreshBalances } = useWalletBalance();

  const handlePurchaseComplete = React.useCallback(async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setIsRefreshing(false);
  }, [refreshBalances]);

  const Category = ({ icon, label }: { icon: string; label: string }) => (
    <button className="flex flex-col items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/80 hover:bg-white/[.08]">
      <Image src={`/icon/${icon}.svg`} alt="" width={32} height={32} />
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="hidden sticky top-[112px] h-[calc(100vh-112px)] overflow-y-auto sidebar-scroll shrink-0 border border-white/10 bg-gradient-to-b from-[#1b1d33] to-[#11131f] md:block py-6">
      <div className="flex flex-col gap-4">
        <div className="border-white/10 p-6">
          <div className="flex items-center justify-between bg-white/5 py-3 px-4 rounded-md">
            <div className="flex items-center gap-2 text-white/80">
              <Image
                src="/icon/coin.svg"
                alt="Coin"
                width={32}
                height={32}
                className={isRefreshing ? "animate-pulse" : ""}
              />
              <span
                className={`text-2xl transition-all duration-300 ${
                  isRefreshing ? "animate-pulse text-[#1FE6E5]" : ""
                }`}
              >
                {loading || isRefreshing
                  ? "..."
                  : walletInfo?.balances?.vs?.toFixed(0) || "0"}
              </span>
            </div>
            <Button
              onClick={() => setBuyTokensOpen(true)}
              className="size-8 rounded-md bg-[#1FE6E5] p-0 text-black hover:bg-[#1FE6E5]/90"
            >
              +
            </Button>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="mt-4 h-10 w-full rounded-md bg-[#1FE6E5] text-black hover:bg-[#1FE6E5]/90"
          >
            Create a Prediction
          </Button>
        </div>

        <nav className="flex flex-col gap-4 text-sm text-white/80">
          <Link
            href="/"
            className={`flex w-full items-center gap-2 px-6 py-4 transition-colors hover:bg-white/5 ${
              pathname === "/"
                ? "border-l-4 border-[#7C3AED] bg-gradient-to-r from-[#3c2a73]/80 to-transparent"
                : ""
            }`}
          >
            <Image src="/icon/home.svg" alt="" width={24} height={24} />
            <span>Home</span>
          </Link>
          <Link
            href="/prize-pool"
            className={`flex w-full items-center gap-2 px-6 py-4 transition-colors hover:bg-white/5 ${
              pathname === "/prize-pool"
                ? "border-l-4 border-[#7C3AED] bg-gradient-to-r from-[#3c2a73]/80 to-transparent"
                : ""
            }`}
          >
            <Image src="/icon/prize_pool.svg" alt="" width={24} height={24} />
            <span>Prize Pool</span>
          </Link>
          <Link
            href="/store"
            className={`flex w-full items-center gap-2 px-6 py-4 transition-colors hover:bg-white/5 ${
              pathname === "/store"
                ? "border-l-4 border-[#7C3AED] bg-gradient-to-r from-[#3c2a73]/80 to-transparent"
                : ""
            }`}
          >
            <Image src="/icon/store.svg" alt="" width={24} height={24} />
            <span>Store</span>
          </Link>
          <Link
            href="/ai"
            className={`flex w-full items-center gap-2 px-6 py-4 transition-colors hover:bg-white/5 ${
              pathname === "/ai"
                ? "border-l-4 border-[#7C3AED] bg-gradient-to-r from-[#3c2a73]/80 to-transparent"
                : ""
            }`}
          >
            <Image src="/icon/ai.svg" alt="" width={24} height={24} />
            <span>WVS AI (Coming soon)</span>
          </Link>
        </nav>

        <div className="py-4 text-xs uppercase flex justify-center items-center gap-4 tracking-wide px-6  ">
          <label className="text-white/60">Categories</label>
          <div className="w-full h-[1px] bg-white/10"></div>
        </div>
        <div className="grid grid-cols-4 gap-2 px-6">
          <Category icon="basketball" label="Basketball" />
          <Category icon="golf" label="Golf" />
          <Category icon="football" label="Football" />
          <Category icon="finance" label="Finance" />
          <Category icon="mma" label="MMA" />
          <Category icon="gaming" label="Gaming" />
          <Category icon="events" label="Events" />
          <Category icon="crypto" label="Crypto" />
        </div>
      </div>

      <CreatePredictionModal open={open} onOpenChange={setOpen} />
      <BuyTokensModal
        open={buyTokensOpen}
        onOpenChange={setBuyTokensOpen}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </aside>
  );
}
