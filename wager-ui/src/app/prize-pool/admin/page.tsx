"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrizePoolAdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) router.replace("/admin/dashboard");
      else router.replace("/admin/login?next=%2Fadmin%2Fdashboard");
    } catch {
      router.replace("/admin/login?next=%2Fadmin%2Fdashboard");
    }
  }, [router]);
  return null;
}
