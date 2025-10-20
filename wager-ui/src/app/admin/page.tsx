"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) router.replace("/admin/dashboard");
      else router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);
  return null;
}