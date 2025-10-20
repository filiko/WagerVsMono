"use client";
import Link from "next/link";

export default function AdminTopBar({ title }: { title?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Link href="/admin/dashboard" className="inline-flex items-center justify-center rounded-md bg-[#9A2BD8] text-white size-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M3 12l2-2 7-7 7 7 2 2"/><path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10"/></svg>
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">{title || "Admin"}</h1>
        <p className="text-sm text-white/60">Admin tools in site style</p>
      </div>
      <div className="ml-auto">
        <button
          className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          onClick={() => { try { localStorage.removeItem("token"); } catch {}; window.location.href = "/admin/login"; }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}