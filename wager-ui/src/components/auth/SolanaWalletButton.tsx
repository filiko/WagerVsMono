"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";

interface SolanaWalletButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  mode?: "login" | "signup";
}

export function SolanaWalletButton({
  onSuccess,
  onError,
  disabled,
  mode = "login",
}: SolanaWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSolanaConnect = async () => {
    try {
      setIsLoading(true);

      const anyWindow = window as any;
      const provider = anyWindow.solana;

      if (!provider) {
        throw new Error(
          "No Solana wallet found. Please install Phantom or another Solana wallet."
        );
      }

      const response = await provider.connect();
      const publicKey = response.publicKey;

      if (!publicKey) {
        throw new Error("Failed to get public key from wallet");
      }

      console.log("Connected Solana wallet:", publicKey.toString());

      const message = `Sign this message to authenticate with WagerVS.\n\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`;

      const encodedMessage = new TextEncoder().encode(message);
      const signature = await provider.signMessage(encodedMessage, "utf8");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const authResponse = await fetch(`${apiUrl}/api/auth/solana`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          publicKey: publicKey.toString(),
          signature: Array.from(signature.signature),
          message: message,
        }),
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.message || "Authentication failed");
      }

      const data = await authResponse.json();
      console.log("Backend response:", data);

      await login();

      onSuccess?.();
    } catch (error) {
      console.error("Solana auth error:", error);
      onError?.(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText =
    mode === "login"
      ? "Login with Solana Wallet"
      : "Sign Up with Solana Wallet";

  return (
    <Button
      onClick={handleSolanaConnect}
      disabled={isLoading || disabled}
      variant="outline"
      className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
    >
      {isLoading ? "Connecting..." : buttonText}
    </Button>
  );
}
