"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export type ChainType = "solana" | "ethereum" | "polygon" | "arbitrum" | "base";

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  chain: ChainType | null;
}

interface TransactionParams {
  to: string;
  amount: number;
  currency: string;
}

const CHAIN_IDS = {
  ethereum: "0x1", // 1
  polygon: "0x89", // 137
  arbitrum: "0xa4b1", // 42161
  base: "0x2105", // 8453
};

const SOLANA_RPC = "https://api.devnet.solana.com";

export function useMultiChainWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    connecting: false,
    address: null,
    chain: null,
  });

  // Check for existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    // Check Phantom (Solana)
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      try {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        if (resp.publicKey) {
          setWallet({
            connected: true,
            connecting: false,
            address: resp.publicKey.toString(),
            chain: "solana",
          });
          return;
        }
      } catch (err) {
        // Silent fail - user hasn't approved auto-connect
      }
    }

    // Check MetaMask (EVM chains)
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          const chain = getChainFromChainId(chainId);
          setWallet({
            connected: true,
            connecting: false,
            address: accounts[0],
            chain,
          });
        }
      } catch (err) {
        console.error("Error checking MetaMask:", err);
      }
    }
  };

  const connectWallet = useCallback(async (chain: ChainType): Promise<boolean> => {
    setWallet((prev) => ({ ...prev, connecting: true }));

    try {
      if (chain === "solana") {
        return await connectSolana();
      } else {
        return await connectEVM(chain);
      }
    } catch (error) {
      console.error(`Error connecting to ${chain}:`, error);
      setWallet({ connected: false, connecting: false, address: null, chain: null });
      return false;
    }
  }, []);

  const connectSolana = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.solana) {
      alert("Phantom wallet not found. Please install it from phantom.app");
      return false;
    }

    try {
      const resp = await window.solana.connect();
      setWallet({
        connected: true,
        connecting: false,
        address: resp.publicKey.toString(),
        chain: "solana",
      });
      return true;
    } catch (error) {
      console.error("Solana connection error:", error);
      return false;
    }
  };

  const connectEVM = async (chain: ChainType): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask not found. Please install it from metamask.io");
      return false;
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        return false;
      }

      // Switch to correct network
      const targetChainId = CHAIN_IDS[chain];
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await addEthereumChain(chain);
        } else {
          throw switchError;
        }
      }

      setWallet({
        connected: true,
        connecting: false,
        address: accounts[0],
        chain,
      });
      return true;
    } catch (error) {
      console.error("EVM connection error:", error);
      return false;
    }
  };

  const addEthereumChain = async (chain: ChainType) => {
    const chainParams: Record<ChainType, any> = {
      ethereum: {
        chainId: CHAIN_IDS.ethereum,
        chainName: "Ethereum Mainnet",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        blockExplorerUrls: ["https://etherscan.io"],
      },
      polygon: {
        chainId: CHAIN_IDS.polygon,
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com"],
      },
      arbitrum: {
        chainId: CHAIN_IDS.arbitrum,
        chainName: "Arbitrum One",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://arbiscan.io"],
      },
      base: {
        chainId: CHAIN_IDS.base,
        chainName: "Base",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"],
      },
      solana: {}, // Not applicable
    };

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [chainParams[chain]],
    });
  };

  const disconnectWallet = useCallback(async () => {
    if (wallet.chain === "solana" && window.solana) {
      try {
        await window.solana.disconnect();
      } catch (error) {
        console.error("Error disconnecting Solana:", error);
      }
    }

    setWallet({ connected: false, connecting: false, address: null, chain: null });
  }, [wallet.chain]);

  const sendTransaction = useCallback(
    async (params: TransactionParams): Promise<string> => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected");
      }

      if (wallet.chain === "solana") {
        return await sendSolanaTransaction(params);
      } else {
        return await sendEVMTransaction(params);
      }
    },
    [wallet]
  );

  const sendSolanaTransaction = async (params: TransactionParams): Promise<string> => {
    if (!window.solana || !wallet.address) {
      throw new Error("Solana wallet not connected");
    }

    const connection = new Connection(SOLANA_RPC, "confirmed");
    const fromPubKey = new PublicKey(wallet.address);
    const toPubKey = new PublicKey(params.to);
    const lamports = Math.floor(params.amount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubKey,
        toPubkey: toPubKey,
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubKey;

    const signed = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return signature;
  };

  const sendEVMTransaction = async (params: TransactionParams): Promise<string> => {
    if (!window.ethereum || !wallet.address) {
      throw new Error("EVM wallet not connected");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // For native currency (ETH, MATIC)
    if (params.currency === "ETH" || params.currency === "MATIC") {
      const tx = await signer.sendTransaction({
        to: params.to,
        value: ethers.parseEther(params.amount.toString()),
      });
      const receipt = await tx.wait();
      return receipt!.hash;
    } else {
      // For tokens (USDC, USDT) - would need token contract address
      throw new Error("Token transfers not yet implemented");
    }
  };

  const getChainFromChainId = (chainId: string): ChainType => {
    const chainMap: Record<string, ChainType> = {
      "0x1": "ethereum",
      "0x89": "polygon",
      "0xa4b1": "arbitrum",
      "0x2105": "base",
    };
    return chainMap[chainId] || "ethereum";
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    sendTransaction,
  };
}

// Type declarations for window objects
declare global {
  interface Window {
    solana?: any;
    ethereum?: any;
  }
}
