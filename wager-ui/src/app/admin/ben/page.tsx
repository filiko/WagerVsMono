"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";

interface CampaignOption {
  campaign_id: string;
  name: string;
}
interface CampaignModel {
  campaign_id?: string;
  name: string;
  description?: string;
  left_button?: string;
  right_button?: string;
  leftWallet?: string;
  rightWallet?: string;
  AiPrediction?: string;
  AIReason?: string;
  image_url?: string;
}

export default function BenCampaignPage() {
  const [options, setOptions] = useState<CampaignOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [model, setModel] = useState<CampaignModel>({ name: "" });
  const [imagePreview, setImagePreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await adminApi.get<any[]>(`/allcampaigns`);
        setOptions(d || []);
      } catch {}
    })();
  }, []);
  useEffect(() => {
    if (selected) loadOne(selected);
    else {
      setModel({ name: "" });
      setImagePreview("");
    }
  }, [selected]);

  async function loadOne(id: string) {
    try {
      const d = await adminApi.get<any>(`/campaign/${id}`);
      setModel({
        campaign_id: id,
        name: d.name || "",
        description: d.description || "",
        left_button: d.left_button || "",
        right_button: d.right_button || "",
        leftWallet: d.leftWallet || "",
        rightWallet: d.rightWallet || "",
        AiPrediction: d.AiPrediction || "",
        AIReason: d.AIReason || "",
        image_url: d.image_url || "",
      });
      setImagePreview(d.image_url || "");
    } catch {}
  }

  async function onImageChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(String(e.target?.result || ""));
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminApi.form<{ url?: string; error?: string }>(
        `/upload`,
        fd
      );
      if (res?.url)
        setModel((m) => ({ ...m, image_url: `/images/${res.url}` }));
      else setMsg(res?.error || "Failed to upload image");
    } catch (e: any) {
      setMsg(e?.message || "Failed to upload image");
    }
  }

  async function onSave() {
    setBusy(true);
    setMsg("");
    try {
      const { campaign_id, ...payload } = model;
      const path = campaign_id ? `/campaign/${campaign_id}` : `/campaign`;
      const method = campaign_id ? "put" : "post";
      const res = await (adminApi as any)[method](path, payload);
      setMsg(res?.message || "Saved");
      if (!campaign_id) {
        try {
          const d = await adminApi.get<any[]>(`/allcampaigns`);
          setOptions(d || []);
        } catch {}
      }
    } catch (e: any) {
      setMsg(e?.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!model.campaign_id) return;
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setBusy(true);
    try {
      const res = await adminApi.del(`/campaign/${model.campaign_id}`);
      setMsg((res as any)?.message || "Deleted");
      setSelected("");
      setModel({ name: "" });
      setImagePreview("");
      try {
        const d = await adminApi.get<any[]>(`/allcampaigns`);
        setOptions(d || []);
      } catch {}
    } catch (e: any) {
      setMsg(e?.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Campaign Management" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Select Campaign
              </label>
              <select
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">New Campaign</option>
                {options.map((o) => (
                  <option key={o.campaign_id} value={o.campaign_id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Campaign Name
              </label>
              <Input
                value={model.name}
                onChange={(e) =>
                  setModel((m) => ({ ...m, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Description
              </label>
              <textarea
                value={model.description || ""}
                onChange={(e) =>
                  setModel((m) => ({ ...m, description: e.target.value }))
                }
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-24"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Left Button
                </label>
                <Input
                  value={model.left_button || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, left_button: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Right Button
                </label>
                <Input
                  value={model.right_button || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, right_button: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Left Wallet
                </label>
                <Input
                  value={model.leftWallet || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, leftWallet: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Right Wallet
                </label>
                <Input
                  value={model.rightWallet || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, rightWallet: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  AI Prediction
                </label>
                <Input
                  value={model.AiPrediction || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, AiPrediction: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  AI Reason
                </label>
                <Input
                  value={model.AIReason || ""}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, AIReason: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Campaign Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageChange(e.target.files?.[0] || null)}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 max-h-48 rounded"
                />
              )}
            </div>
            {msg && <div className="text-sm text-white/80">{msg}</div>}
            <div className="flex gap-3 pt-2">
              <Button onClick={onSave} disabled={busy || !model.name}>
                {busy ? "Saving..." : "Save Campaign"}
              </Button>
              {model.campaign_id && (
                <Button variant="secondary" onClick={onDelete} disabled={busy}>
                  Delete Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
