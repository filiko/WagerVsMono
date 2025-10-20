"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, AtSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { SolanaWalletButton } from "@/components/auth/SolanaWalletButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "react-toastify";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const { login } = useAuth();
  const [connecting, setConnecting] = React.useState<
    null | "google" | "evm" | "solana"
  >(null);
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleGoogleSuccess = async () => {
    onOpenChange(false);
  };

  const handleGoogleError = (error: string) => {
    toast.error(`Google sign-in failed: ${error}`);
  };

  const handleConnectEvm = async () => {
    try {
      setConnecting("evm");
      const anyWindow = window as any;
      const provider = anyWindow.ethereum;
      if (!provider) {
        toast.error("No EVM wallet found. Please install MetaMask.");
        return;
      }
      const accounts: string[] = await provider.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts[0]) {
        console.log("Connected EVM account:", accounts[0]);
        await login();
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet");
    } finally {
      setConnecting(null);
    }
  };

  const handleSolanaSuccess = async () => {
    onOpenChange(false);
  };

  const handleSolanaError = (error: string) => {
    toast.error(`Solana wallet connection failed: ${error}`);
  };

  const handleManualSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      console.log("Manual sign up:", { email, username });
      await login();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign up. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] w-full py-12 text-white border-white/10 max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/icon/logo.svg"
              alt="logo"
              width={160}
              height={40}
              className="h-10"
            />
            <DialogTitle className="text-xl font-semibold">
              Welcome to WagerVS
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={connecting !== null}
          />

          <div className="flex items-center gap-2 text-white/60">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Manual sign up */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                type="email"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            </div>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            </div>
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <Button
              onClick={handleManualSignUp}
              disabled={connecting !== null}
              className="h-12 w-full bg-[#9A2BD8] hover:bg-[#9A2BD8]/90"
            >
              Sign Up With Email Address
            </Button>
          </div>

          {/* Solana wallet connect */}
          <div className="flex items-center gap-2 text-white/60">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <SolanaWalletButton
            onSuccess={handleSolanaSuccess}
            onError={handleSolanaError}
            disabled={connecting !== null}
            mode="signup"
          />

          <p className="text-center text-xs text-white/60">
            By continuing you agree to the Terms and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
