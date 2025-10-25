"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

interface BuyTokensModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

export function BuyTokensModal({
  open,
  onOpenChange,
  onPurchaseComplete,
}: BuyTokensModalProps) {
  const [usdAmount, setUsdAmount] = React.useState("0");
  const [vsAmount, setVsAmount] = React.useState("0");
  const [selectedCurrency, setSelectedCurrency] = React.useState("SOL");
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const { wallet, connectWallet, isPhantomInstalled, forceReconnect } =
    useSolanaWallet();
  const { walletInfo, refreshBalances } = useWalletBalance();
  const conversionRate = 20000;

  const ADMIN_WALLET_ADDRESS = "Bga4DjWmDXDaodXcDVr4EzEXSDT78vgmacSrf9zZw6b5";
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  React.useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/wallet/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          publicKey: wallet.publicKey,
        }),
      }).catch((error: any) => {
        console.error("Failed to connect wallet to backend:", error);
      });
    }
  }, [wallet.connected, wallet.publicKey]);

  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
    const usd = parseFloat(value) || 0;
    setVsAmount((usd * conversionRate).toString());
  };

  const handleVsChange = (value: string) => {
    setVsAmount(value);
    const vs = parseFloat(value) || 0;
    setUsdAmount((vs / conversionRate).toString());
  };

  const handleSolChange = (value: string) => {
    setUsdAmount(value);
    if (walletInfo?.solana?.price?.price) {
      const solAmount = parseFloat(value) || 0;
      const usdValue = solAmount * walletInfo.solana.price.price;
      const vsTokens = usdValue * conversionRate;
      console.log(
        `Frontend SOL Conversion: ${solAmount} SOL × $${
          walletInfo.solana.price.price
        } = $${usdValue.toFixed(
          2
        )} × ${conversionRate} = ${vsTokens.toLocaleString()} VS`
      );
      setVsAmount(vsTokens.toString());
    }
  };

  const handleQuickBuy = (amount: string) => {
    setUsdAmount(amount);
    if (selectedCurrency === "SOL" && walletInfo?.solana?.price?.price) {
      const solAmount = parseFloat(amount);
      const usdValue = solAmount * walletInfo.solana.price.price;
      setVsAmount((usdValue * conversionRate).toString());
    } else {
      const usd = parseFloat(amount);
      setVsAmount((usd * conversionRate).toString());
    }
  };

  const sendSolToAdmin = async (solAmount: number) => {
    try {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const fromPubKey = new PublicKey(wallet.publicKey);
      const toPubKey = new PublicKey(ADMIN_WALLET_ADDRESS);

      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubKey;

      const signature = await window.solana!.signAndSendTransaction(
        transaction
      );

      console.log("SOL transfer signature:", signature);

      await connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      console.error("Error sending SOL:", error);
      throw error;
    }
  };

  const handleBuy = async () => {
    if (!wallet.connected) {
      const connected = await connectWallet();
      if (!connected) {
        toast.error("Failed to connect wallet. Please try again.");
        return;
      }
    }

    if (!wallet.publicKey) {
      toast.error("Wallet not connected. Please try the 'Reconnect' button.");
      return;
    }

    setIsPurchasing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const connectResponse = await fetch(`${apiUrl}/api/wallet/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          publicKey: wallet.publicKey,
        }),
      });

      if (!connectResponse.ok) {
        throw new Error("Failed to connect wallet to backend");
      }

      let transactionSignature = null;

      if (selectedCurrency === "SOL") {
        const solAmount = parseFloat(usdAmount);

        const transferResult = await sendSolToAdmin(solAmount);
        transactionSignature =
          typeof transferResult === "string"
            ? transferResult
            : (transferResult as any)?.signature;
        console.log("SOL transfer completed:", transactionSignature);
      }

      const purchaseResponse = await fetch(`${apiUrl}/api/wallet/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: usdAmount,
          currency: selectedCurrency,
          vsAmount: vsAmount,
          transactionSignature: transactionSignature,
        }),
      });

      if (!purchaseResponse.ok) {
        const error = await purchaseResponse.json();
        throw new Error(error.error || "Purchase failed");
      }

      const result = await purchaseResponse.json();

      if (selectedCurrency === "SOL") {
        const signature =
          typeof transactionSignature === "string"
            ? transactionSignature
            : (transactionSignature as any)?.signature || "Unknown";
        toast.success(`Successfully purchased ${vsAmount} $VS tokens!`);
      } else {
        toast.success(`Successfully purchased ${vsAmount} $VS tokens!`);
      }

      console.log("Purchase result:", result);

      refreshBalances();

      if (onPurchaseComplete) {
        onPurchaseComplete();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error(
        `Purchase failed: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] w-full border-white/10 text-white max-w-md py-20">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/icon/logo.svg"
              alt="logo"
              width={200}
              height={48}
              className="h-12"
            />
            <DialogTitle className="text-2xl font-semibold text-white text-center">
              BUY TOKENS
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {!isPhantomInstalled ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 text-center">
              <p className="text-red-400 text-sm">
                Phantom wallet not installed. Please install it to continue.
              </p>
              <Button
                onClick={() => window.open("https://phantom.app/", "_blank")}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Install Phantom
              </Button>
            </div>
          ) : !wallet.connected ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-md p-3 text-center">
              <p className="text-yellow-400 text-sm">
                Connect your Solana wallet to purchase tokens.
              </p>
              <Button
                onClick={connectWallet}
                disabled={wallet.connecting}
                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
              >
                {wallet.connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-500/50 rounded-md p-3">
              <p className="text-green-400 text-sm">
                ✅ Wallet Connected: {wallet.publicKey?.slice(0, 8)}...
                {wallet.publicKey?.slice(-8)}
              </p>
            </div>
          )}

          <div className="bg-white/5 flex px-3 items-center justify-between rounded-md h-12 text-white placeholder:text-white/40">
            <div className="flex flex-col">
              <p className="text-white/80">
                Balance: {walletInfo?.solana?.balance.sol.toFixed(4) || "0"} SOL
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshBalances}
                className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
                disabled={!wallet.connected}
              >
                Refresh
              </button>
              <button
                onClick={forceReconnect}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
              >
                Reconnect
              </button>
            </div>
          </div>

          <div className="">
            <div className="relative">
              <Input
                value={usdAmount}
                onChange={(e) => {
                  if (selectedCurrency === "SOL") {
                    handleSolChange(e.target.value);
                  } else {
                    handleUsdChange(e.target.value);
                  }
                }}
                placeholder="0"
                className="bg-white/5 border-[#1FE6E5] text-white placeholder:text-white/40 h-12 text-lg pr-28"
              />
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="absolute right-2 top-1/2 -translate-y-1/2 w-24 bg-[#1a1a2e] border-none  text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]">
                  <SelectItem value="SOL" className="text-white">
                    SOL
                  </SelectItem>
                  <SelectItem value="USDC" className="text-white">
                    USDC
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="">
            <div className="relative">
              <Input
                value={vsAmount}
                onChange={(e) => handleVsChange(e.target.value)}
                placeholder="0"
                className="bg-white/5 border-[#1FE6E5] text-white placeholder:text-white/40 h-12 text-lg pr-28"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 border rounded-md flex justify-center items-center bg-[#1a1a2e] border-none text-white h-8">
                VS
              </div>
            </div>
          </div>
          <div className="">
            <div className="grid grid-cols-4 gap-2">
              {selectedCurrency === "SOL"
                ? ["0.1", "0.25", "0.5", "1"].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => handleQuickBuy(amount)}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10"
                    >
                      {amount} SOL
                    </Button>
                  ))
                : ["25", "50", "100", "200"].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => handleQuickBuy(amount)}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10"
                    >
                      ${amount}
                    </Button>
                  ))}
            </div>
          </div>

          <Button
            onClick={handleBuy}
            disabled={!wallet.connected || isPurchasing || !isPhantomInstalled}
            className="w-full bg-[#9A2BD8] text-white hover:bg-[#9A2BD8]/90 h-12 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPurchasing ? "Processing..." : "Buy $VS Chips"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
