"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

interface WalletBalances {
  sol: number;
  usdc: number;
  vs: number;
}

interface SolanaInfo {
  publicKey: string;
  balance: {
    sol: number;
    lamports: number;
    usd: number;
  };
  price: {
    price: number;
    currency: string;
    timestamp: number;
  };
  timestamp: number;
}

interface WalletInfo {
  hasWallet: boolean;
  publicKey: string | null;
  balances: WalletBalances;
  solana: SolanaInfo | null;
  user: {
    id: number;
    name: string | null;
    email: string | null;
  };
}

export const useWalletBalance = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const fetchWalletInfo = useCallback(async () => {
    if (!user) {
      setWalletInfo(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/wallet/info`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setWalletInfo(null);
          setError(null);
          return;
        }
        throw new Error("Failed to fetch wallet info");
      }

      const data = await response.json();
      setWalletInfo(data);
    } catch (err) {
      console.error("Error fetching wallet info:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch wallet info"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateBalances = useCallback(
    async (balances: Partial<WalletBalances>) => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/wallet/balances`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(balances),
        });

        if (!response.ok) {
          throw new Error("Failed to update balances");
        }

        const data = await response.json();

        if (walletInfo) {
          setWalletInfo({
            ...walletInfo,
            balances: data.balances,
          });
        }

        return data;
      } catch (err) {
        console.error("Error updating balances:", err);
        throw err;
      }
    },
    [walletInfo]
  );

  const refreshBalances = useCallback(() => {
    fetchWalletInfo();
  }, [fetchWalletInfo]);

  useEffect(() => {
    if (!authLoading) {
      fetchWalletInfo();
    }
  }, [fetchWalletInfo, authLoading]);

  return {
    walletInfo,
    loading,
    error,
    refreshBalances,
    updateBalances,
  };
};
