"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "./AuthProvider";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);

        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
        );
        const userInfo = await userInfoResponse.json();

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userInfo,
            accessToken: tokenResponse.access_token,
          }),
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Backend response:", data);

        await login();

        onSuccess?.();
      } catch (error) {
        console.error("Google auth error:", error);
        onError?.(
          error instanceof Error ? error.message : "Authentication failed"
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      onError?.(error.error_description || "Google login failed");
    },
  });

  return (
    <Button
      onClick={() => handleGoogleLogin()}
      disabled={isLoading || disabled}
      className="h-12 w-full bg-[#9A2BD8] hover:bg-[#9A2BD8]/90"
    >
      <Image
        src="/icon/google.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
