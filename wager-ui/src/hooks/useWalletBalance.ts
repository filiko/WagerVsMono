"use client";

import { useState, useEffect, useCallback } from "react";
import { useMultiChainWallet, ChainType } from "./useMultiChainWallet";

interface BalanceData {
  balances: Record<string, number>;
  prices: Record<string, number>;
  lastUpdated: string;
}

interface WalletBalances {
  [chain: string]: BalanceData;
}

export function useWalletBalance() {
  const [balances, setBalances] = useState<WalletBalances>({});
  const [loading, setLoading] = useState(false);
  const { wallet } = useMultiChainWallet();

  const fetchBalance = useCallback(
    async (chain: ChainType, address: string) => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(
          `${apiUrl}/api/wallet/balance?address=${address}&chain=${chain}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch balance for ${chain}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Error fetching balance for ${chain}:`, error);
        return null;
      }
    },
    []
  );

  const fetchPrices = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/wallet/prices`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }

      const data = await response.json();
      return data.prices;
    } catch (error) {
      console.error("Error fetching prices:", error);
      return null;
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!wallet.connected || !wallet.address || !wallet.chain) {
      return;
    }

    setLoading(true);
    try {
      const [balanceData, prices] = await Promise.all([
        fetchBalance(wallet.chain, wallet.address),
        fetchPrices(),
      ]);

      if (balanceData) {
        setBalances((prev) => ({
          ...prev,
          [wallet.chain!]: {
            ...balanceData,
            prices: prices?.[wallet.chain!] || {},
          },
        }));
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setLoading(false);
    }
  }, [
    wallet.connected,
    wallet.address,
    wallet.chain,
    fetchBalance,
    fetchPrices,
  ]);

  // Auto-refresh when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.address && wallet.chain) {
      refreshBalances();
    }
  }, [wallet.connected, wallet.address, wallet.chain, refreshBalances]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (wallet.connected && wallet.chain) {
        try {
          const prices = await fetchPrices();
          if (prices) {
            setBalances((prev) => ({
              ...prev,
              [wallet.chain!]: {
                ...prev[wallet.chain!],
                prices: prices[wallet.chain!] || {},
                lastUpdated: new Date().toISOString(),
              },
            }));
          }
        } catch (error) {
          console.error("Error auto-refreshing prices:", error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [wallet.connected, wallet.chain, fetchPrices]);

  return {
    balances,
    loading,
    refreshBalances,
    walletInfo: wallet,
  };
}
