"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Status = {
  eligible: boolean;
  amount: number;
  nextResetAt: string;
};

export function DailyClaimButton() {
  const [status, setStatus] = React.useState<Status | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [claiming, setClaiming] = React.useState(false);

  async function fetchStatus() {
    try {
      setLoading(true);
      const res = await fetch(`/api/wallet/daily-status`, {
        credentials: "include",
      });
      const data = await res.json();
      setStatus(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchStatus();
  }, []);

  async function claim() {
    try {
      setClaiming(true);
      const res = await fetch(`/api/wallet/daily-claim`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        await fetchStatus();
      }
    } finally {
      setClaiming(false);
    }
  }

  const disabled = loading || claiming || status?.eligible === false;
  const label = status?.eligible ? `Claim ${status.amount} VS` : "Claimed";

  return (
    <Button
      onClick={claim}
      disabled={disabled}
      className="h-10 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white"
    >
      {claiming ? "Claiming..." : label}
    </Button>
  );
}
