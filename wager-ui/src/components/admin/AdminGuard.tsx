"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const next = encodeURIComponent(pathname || "/admin/dashboard");
        router.replace(`/admin/login?next=${next}`);
        return;
      }
      setReady(true);
    } catch {
      const next = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/admin/login?next=${next}`);
    }
  }, [router, pathname]);

  if (!ready) return null;
  return <>{children}</>;
}
