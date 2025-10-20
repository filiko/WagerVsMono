"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdminGuard from "@/components/admin/AdminGuard";
import { Shield, Boxes, Package, Wallet, Coins, Megaphone, ExternalLink, LogOut, Gift, Database } from "lucide-react";

const cards = [
  { href: "/admin/cms", label: "Build Campaigns", icon: Boxes },
  { href: "/admin/distribute", label: "Distribution", icon: Gift },
  { href: "/admin/refund", label: "Refunds", icon: Wallet },
  { href: "/admin/venmo-payouts", label: "Venmo Payouts", icon: Coins },
  { href: "/admin/add-product", label: "Products", icon: Package },
  { href: "/admin/add-lootcrate", label: "Loot Crates", icon: Database },
  { href: "/admin/web2-distribute", label: "Web2 Distribute", icon: Megaphone },
  { href: "/admin/external-points", label: "External Points", icon: ExternalLink },
  { href: "/admin/vs", label: "Calculator", icon: Database },
  { href: "/admin/buy", label: "Buy VS", icon: Coins },
  { href: "/admin/get-balance", label: "Get Balance", icon: Wallet },
  { href: "/admin/reconcile", label: "Reconcile", icon: Shield },
  { href: "/admin/airdrop", label: "Airdrop", icon: Gift },];

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-md bg-[#9A2BD8] text-white size-10">
              <Shield className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Utilities</h1>
              <p className="text-sm text-white/60">Temporary dev access. Admin pages are being migrated.</p>
            </div>
            <div className="ml-auto">
              <Button variant="secondary" onClick={() => { localStorage.removeItem("token"); location.href = "/admin/login"; }}>
                <LogOut className="mr-2 size-4" /> Logout
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {cards.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="group block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center rounded-md bg-white/10 text-white size-9 group-hover:bg-[#1FE6E5]/20 group-hover:text-[#1FE6E5] transition">
                    <Icon className="size-5" />
                  </div>
                  <div className="font-medium">{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}