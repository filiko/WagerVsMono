"use client";
import AdminGuard from "@/components/admin/AdminGuard";

export default function LegacyFrame({ src, title }: { src: string; title: string }) {
  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-white/60">Legacy tool is embedded below while we migrate it to native components.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <iframe src={src} className="w-full" style={{ height: "calc(100vh - 180px)" }} />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}