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
import { useMultiChainWallet } from "@/hooks/useMultiChainWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";

interface BuyTokensModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

type ChainType = "solana" | "ethereum" | "polygon" | "arbitrum" | "base";
type CurrencyType = "SOL" | "ETH" | "MATIC" | "USDC" | "USDT";

export function BuyTokensModal({
  open,
  onOpenChange,
  onPurchaseComplete,
}: BuyTokensModalProps) {
  const [amount, setAmount] = React.useState("0");
  const [vsAmount, setVsAmount] = React.useState("0");
  const [selectedChain, setSelectedChain] = React.useState<ChainType>("solana");
  const [selectedCurrency, setSelectedCurrency] =
    React.useState<CurrencyType>("SOL");
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const { wallet, connectWallet, disconnectWallet, sendTransaction } =
    useMultiChainWallet();
  const { balances, refreshBalances } = useWalletBalance();
  const conversionRate = 20000; // VS tokens per USD

  const ADMIN_ADDRESSES = {
    solana: "Bga4DjWmDXDaodXcDVr4EzEXSDT78vgmacSrf9zZw6b5",
    ethereum: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4", // Replace with your ETH address
    polygon: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4", // Replace with your Polygon address
    arbitrum: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4", // Replace with your Arbitrum address
    base: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4", // Replace with your Base address
  };

  const chainConfig = {
    solana: {
      name: "Solana",
      currencies: ["SOL", "USDC"],
      icon: "⬡",
    },
    ethereum: {
      name: "Ethereum",
      currencies: ["ETH", "USDC", "USDT"],
      icon: "Ξ",
    },
    polygon: {
      name: "Polygon",
      currencies: ["MATIC", "USDC", "USDT"],
      icon: "⬣",
    },
    arbitrum: {
      name: "Arbitrum",
      currencies: ["ETH", "USDC", "USDT"],
      icon: "◆",
    },
    base: {
      name: "Base",
      currencies: ["ETH", "USDC"],
      icon: "🔵",
    },
  };

  const currencyPrices = React.useMemo(
    () => ({
      SOL: balances[selectedChain]?.prices?.native || 0,
      ETH: balances[selectedChain]?.prices?.native || 0,
      MATIC: balances[selectedChain]?.prices?.native || 0,
      USDC: 1,
      USDT: 1,
    }),
    [balances, selectedChain]
  );

  React.useEffect(() => {
    if (wallet.connected && wallet.address) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      fetch(`${apiUrl}/api/wallet/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: wallet.address,
          chain: wallet.chain,
        }),
      }).catch((error) => {
        console.error("Failed to connect wallet to backend:", error);
      });
    }
  }, [wallet.connected, wallet.address, wallet.chain]);

  React.useEffect(() => {
    const availableCurrencies = chainConfig[selectedChain].currencies;
    if (!availableCurrencies.includes(selectedCurrency)) {
      setSelectedCurrency(availableCurrencies[0] as CurrencyType);
    }
  }, [selectedChain]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const parsedAmount = parseFloat(value) || 0;
    const price = currencyPrices[selectedCurrency] || 1;
    const usdValue = parsedAmount * price;
    setVsAmount((usdValue * conversionRate).toString());
  };

  const handleQuickBuy = (quickAmount: string) => {
    setAmount(quickAmount);
    const parsedAmount = parseFloat(quickAmount);
    const price = currencyPrices[selectedCurrency] || 1;
    const usdValue = parsedAmount * price;
    setVsAmount((usdValue * conversionRate).toString());
  };

  const handleBuy = async () => {
    if (!wallet.connected) {
      const connected = await connectWallet(selectedChain);
      if (!connected) {
        toast.error("Failed to connect wallet. Please try again.");
        return;
      }
    }

    if (!wallet.address) {
      toast.error("Wallet not connected. Please try again.");
      return;
    }

    if (wallet.chain !== selectedChain) {
      toast.error(
        `Please switch to ${chainConfig[selectedChain].name} network`
      );
      return;
    }

    setIsPurchasing(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }

      // Send transaction to admin wallet
      const txSignature = await sendTransaction({
        to: ADMIN_ADDRESSES[selectedChain],
        amount: parsedAmount,
        currency: selectedCurrency,
      });

      console.log(`${selectedChain} transaction:`, txSignature);

      // Register purchase with backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const purchaseResponse = await fetch(`${apiUrl}/api/wallet/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          currency: selectedCurrency,
          chain: selectedChain,
          vsAmount,
          transactionSignature: txSignature,
        }),
      });

      if (!purchaseResponse.ok) {
        const error = await purchaseResponse.json();
        throw new Error(error.error || "Purchase failed");
      }

      toast.success(
        `Successfully purchased ${parseFloat(
          vsAmount
        ).toLocaleString()} $VS tokens!`
      );
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

  const quickBuyAmounts = React.useMemo(() => {
    if (selectedCurrency === "SOL") return ["0.1", "0.25", "0.5", "1"];
    if (selectedCurrency === "ETH") return ["0.01", "0.05", "0.1", "0.25"];
    if (selectedCurrency === "MATIC") return ["10", "25", "50", "100"];
    return ["25", "50", "100", "200"]; // Stablecoins
  }, [selectedCurrency]);

<<<<<<< HEAD
  const currentBalance = wallet.connected && wallet.chain
    ? balances[wallet.chain]?.balances?.[selectedCurrency.toLowerCase()] || 0
    : 0;
=======
  const currentBalance =
    wallet.connected && wallet.chain
      ? balances[wallet.chain]?.balances?.[selectedCurrency.toLowerCase()] || 0
      : 0;
>>>>>>> f6e85e0776e27049e6a0c69c62da60e803d8ceee

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
          {/* Connection Status */}
          {!wallet.connected ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-md p-3 text-center">
              <p className="text-yellow-400 text-sm mb-2">
                Connect your wallet to purchase tokens.
              </p>
              <Button
                onClick={() => connectWallet(selectedChain)}
                disabled={wallet.connecting}
                className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-sm"
              >
                {wallet.connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-500/50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <p className="text-green-400 text-sm">
                  ✅ {chainConfig[wallet.chain as ChainType]?.name}:{" "}
                  {wallet.address?.slice(0, 6)}...
                  {wallet.address?.slice(-4)}
                </p>
                <Button
                  onClick={disconnectWallet}
                  size="sm"
                  className="text-xs bg-red-500/50 hover:bg-red-500/70 h-6 px-2"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {/* Chain Selector */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Select Network
            </label>
            <Select
              value={selectedChain}
              onValueChange={(val) => setSelectedChain(val as ChainType)}
            >
              <SelectTrigger className="bg-white/5 border-cyan-400/30 text-white h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                {Object.entries(chainConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-white">
                    {config.icon} {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance Display */}
          <div className="bg-white/5 flex px-3 items-center justify-between rounded-md h-12 text-white">
            <p className="text-white/80 text-sm">
              Balance: {currentBalance.toFixed(4)} {selectedCurrency}
            </p>
            <button
              onClick={refreshBalances}
              className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
              disabled={!wallet.connected}
            >
              Refresh
            </button>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <Input
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="bg-white/5 border-cyan-400/30 text-white placeholder:text-white/40 h-12 text-lg pr-32"
            />
            <Select
              value={selectedCurrency}
              onValueChange={(val) => setSelectedCurrency(val as CurrencyType)}
            >
              <SelectTrigger className="absolute right-2 top-1/2 -translate-y-1/2 w-24 bg-[#1a1a2e] border-none text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                {chainConfig[selectedChain].currencies.map((currency) => (
                  <SelectItem
                    key={currency}
                    value={currency}
                    className="text-white"
                  >
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VS Amount Display */}
          <div className="relative">
            <Input
              value={parseFloat(vsAmount).toLocaleString()}
              readOnly
              placeholder="0"
              className="bg-white/5 border-cyan-400/30 text-white placeholder:text-white/40 h-12 text-lg pr-28"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 border rounded-md flex justify-center items-center bg-[#1a1a2e] border-none text-white h-8">
              VS
            </div>
          </div>

          {/* Quick Buy Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickBuyAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                onClick={() => handleQuickBuy(quickAmount)}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 text-xs"
              >
                {quickAmount}
              </Button>
            ))}
          </div>

          {/* Buy Button */}
          <Button
            onClick={handleBuy}
            disabled={isPurchasing || parseFloat(amount) <= 0}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-700 hover:to-cyan-600 h-12 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPurchasing ? "Processing..." : "Buy $VS Chips"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
