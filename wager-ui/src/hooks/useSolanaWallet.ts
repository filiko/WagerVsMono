"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

interface SolanaWallet {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
}

// declare global {
//   interface Window {
//     solana?: {
//       isPhantom?: boolean;
//       isConnected?: boolean;
//       connect: () => Promise<{ publicKey: { toString: () => string } }>;
//       disconnect: () => Promise<void>;
//       on: (event: string, callback: (args: any) => void) => void;
//       off: (event: string, callback: (args: any) => void) => void;
//       request: (params: any) => Promise<any>;
//       signAndSendTransaction: (transaction: any) => Promise<string>;
//     };
//   }
// }

export const useSolanaWallet = () => {
  const [wallet, setWallet] = useState<SolanaWallet>({
    publicKey: null,
    connected: false,
    connecting: false,
  });

  const waitForWallet = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.solana && window.solana.isPhantom) {
        resolve(true);
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        if (window.solana && window.solana.isPhantom) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined") {
      toast.error("Window object not available");
      return false;
    }

    const isWalletReady = await waitForWallet();
    if (!isWalletReady) {
      toast.error(
        "Solana wallet not found! Please install Phantom wallet extension and refresh the page."
      );
      return false;
    }

    if (!window.solana) {
      toast.error(
        "Solana wallet not found! Please install a Solana wallet extension (Phantom, Solflare, etc.)"
      );
      return false;
    }

    setWallet((prev) => ({ ...prev, connecting: true }));

    try {
      if (!window.solana.connect) {
        throw new Error("Wallet connect method not available");
      }

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          response = await window.solana.connect();
          break;
        } catch (retryError: any) {
          retries++;
          if (retries >= maxRetries) {
            throw retryError;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!response || !response.publicKey) {
        throw new Error("Invalid response from wallet");
      }

      const publicKey = response.publicKey.toString();

      setWallet({
        publicKey,
        connected: true,
        connecting: false,
      });

      localStorage.setItem("solanaWallet", publicKey);
      toast.success("Wallet connected successfully!");

      return true;
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setWallet((prev) => ({ ...prev, connecting: false }));

      if (error.code === 4001) {
        toast.error("User rejected the connection request");
      } else if (error.code === -32002) {
        toast.error("Wallet connection request already pending");
      } else if (error.message?.includes("User rejected")) {
        toast.error("Connection was rejected by user");
      } else if (error.message?.includes("already connected")) {
        toast.error("Wallet is already connected");
      } else {
        toast.error(
          `Failed to connect wallet: ${error.message || "Unknown error"}`
        );
      }

      return false;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.solana) {
        await window.solana.disconnect();
      }

      setWallet({
        publicKey: null,
        connected: false,
        connecting: false,
      });

      localStorage.removeItem("solanaWallet");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  }, []);

  const checkWalletConnection = useCallback(async () => {
    if (typeof window !== "undefined" && window.solana) {
      try {
        const storedWallet = localStorage.getItem("solanaWallet");
        if (storedWallet && window.solana.isConnected) {
          setWallet({
            publicKey: storedWallet,
            connected: true,
            connecting: false,
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        localStorage.removeItem("solanaWallet");
      }
    }
  }, []);

  useEffect(() => {
    checkWalletConnection();

    if (typeof window !== "undefined" && window.solana) {
      const handleAccountChange = (publicKey: any) => {
        if (publicKey) {
          setWallet({
            publicKey: publicKey.toString(),
            connected: true,
            connecting: false,
          });
          localStorage.setItem("solanaWallet", publicKey.toString());
        } else {
          setWallet({
            publicKey: null,
            connected: false,
            connecting: false,
          });
          localStorage.removeItem("solanaWallet");
        }
      };

      window.solana.on("accountChanged", handleAccountChange);

      return () => {
        window.solana?.off("accountChanged", handleAccountChange);
      };
    }
  }, [checkWalletConnection]);

  const forceReconnect = useCallback(async () => {
    localStorage.removeItem("solanaWallet");
    setWallet({
      publicKey: null,
      connected: false,
      connecting: false,
    });

    setTimeout(() => {
      connectWallet();
    }, 100);
  }, [connectWallet]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    forceReconnect,
    isPhantomInstalled:
      typeof window !== "undefined" && !!window.solana?.isPhantom,
    isWalletAvailable: typeof window !== "undefined" && !!window.solana,
  };
};
