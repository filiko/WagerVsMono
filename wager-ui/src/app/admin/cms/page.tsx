"use client";
import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";

interface Campaign {
  campaign_id?: string;
  name: string;
  description?: string;
  left_button?: string;
  right_button?: string;
  status?: string;
  lock_at?: string;
  expiresAt?: string;
  ai_prediction?: string;
  AiPrediction?: string;
  AIReason?: string;
  category_id?: string;
  image_url?: string;
}

export default function CMSPage() {
  const [campaigns, setCampaigns] = useState<
    Array<{
      campaign_id: string;
      name: string;
      status?: string;
      visibility?: string;
    }>
  >([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [model, setModel] = useState<Campaign>({
    name: "",
    description: "",
    status: "pending",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadCampaigns();
    loadCategories();
  }, []);

  async function loadCampaigns() {
    try {
      const data = await adminApi.get<any[]>("/allcampaigns");
      setCampaigns(
        (data || []).map((c: any) => ({
          campaign_id: c.campaign_id,
          name: c.name,
          status: c.status,
          visibility: c.visibility,
        }))
      );
    } catch {}
  }

  async function loadCategories() {
    try {
      const data = await adminApi.get<any[]>("/categories");
      setCategories(data || []);
    } catch {}
  }

  async function loadOne(id: string) {
    if (!id) {
      setModel({ name: "", description: "", status: "pending" });
      setImageFile(null);
      return;
    }
    try {
      const data = await adminApi.get<any>(`/campaign/${id}`);
      setModel({
        campaign_id: id,
        name: data.name || "",
        description: data.description || "",
        left_button: data.left_button || "",
        right_button: data.right_button || "",
        status: data.status || "pending",
        lock_at: data.lock_at ? formatForInput(data.lock_at) : "",
        expiresAt: data.expiresAt ? formatForInput(data.expiresAt) : "",
        ai_prediction: data.ai_prediction || "",
        AiPrediction: data.AiPrediction || "",
        AIReason: data.AIReason || "",
        category_id: data.category_id || "",
        image_url: data.image_url || "",
      });
    } catch {
      /* ignore */
    }
  }

  function formatForInput(dt: string) {
    try {
      const d = new Date(dt);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch {
      return "";
    }
  }

  async function onSave() {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", model.name || "");
      if (model.description) fd.append("description", model.description);
      if (model.left_button) fd.append("left_button", model.left_button);
      if (model.right_button) fd.append("right_button", model.right_button);
      if (model.status) fd.append("status", model.status);
      if (model.lock_at) fd.append("lock_at", model.lock_at);
      if (model.expiresAt) fd.append("expiresAt", model.expiresAt);
      if (model.ai_prediction) fd.append("ai_prediction", model.ai_prediction);
      if (model.AiPrediction) fd.append("AiPrediction", model.AiPrediction);
      if (model.AIReason) fd.append("AIReason", model.AIReason);
      if (model.category_id) fd.append("category_id", model.category_id);
      const tzOff = -new Date().getTimezoneOffset() / 60;
      fd.append("timezoneOffset", `UTC${tzOff >= 0 ? `+${tzOff}` : tzOff}`);
      if (imageFile) fd.append("image_url", imageFile);

      if (selectedId) await adminApi.form(`/campaign/${selectedId}`, fd, "PUT");
      else await adminApi.form("/campaign", fd, "POST");

      await loadCampaigns();
      if (!selectedId) setSelectedId("");
      alert("Campaign saved successfully");
    } catch (e: any) {
      alert(e?.message || "Failed to save campaign");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!selectedId) {
      alert("No campaign selected");
      return;
    }
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setBusy(true);
    try {
      await adminApi.del(`/campaign/${selectedId}`);
      await loadCampaigns();
      setSelectedId("");
      setModel({ name: "", description: "", status: "pending" });
      alert("Campaign deleted");
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadOne(selectedId);
  }, [selectedId]);

  const canSave = useMemo(
    () =>
      !!model.name &&
      !!(model.left_button || "").length &&
      !!(model.right_button || "").length,
    [model]
  );

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Campaign Management" />

          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Filters
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  id="profile_id"
                >
                  <option value="">All Users</option>
                </select>
                <select
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  id="visibility"
                >
                  <option value="">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <select
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  id="statusFilter"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="mt-2">
                <Button variant="secondary" onClick={loadCampaigns}>
                  Apply
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Select Campaign
              </label>
              <select
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">New Campaign</option>
                {campaigns.map((c) => (
                  <option key={c.campaign_id} value={c.campaign_id}>
                    {c.name} ({c.status} -- {c.visibility})
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
                onChange={(e) => setModel({ ...model, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-24"
                value={model.description || ""}
                onChange={(e) =>
                  setModel({ ...model, description: e.target.value })
                }
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  AI Prediction
                </label>
                <Input
                  value={model.AiPrediction || ""}
                  onChange={(e) =>
                    setModel({ ...model, AiPrediction: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  AI Prediction (side)
                </label>
                <select
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  value={model.ai_prediction || ""}
                  onChange={(e) =>
                    setModel({ ...model, ai_prediction: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                AI Reason
              </label>
              <textarea
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-24"
                value={model.AIReason || ""}
                onChange={(e) =>
                  setModel({ ...model, AIReason: e.target.value })
                }
              ></textarea>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Category
              </label>
              <select
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                value={model.category_id || ""}
                onChange={(e) =>
                  setModel({ ...model, category_id: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Left Button
                </label>
                <Input
                  value={model.left_button || ""}
                  onChange={(e) =>
                    setModel({ ...model, left_button: e.target.value })
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
                    setModel({ ...model, right_button: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Status
                </label>
                <select
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  value={model.status || "pending"}
                  onChange={(e) =>
                    setModel({ ...model, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Lock At
                </label>
                <Input
                  type="datetime-local"
                  value={model.lock_at || ""}
                  onChange={(e) =>
                    setModel({ ...model, lock_at: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Expires At
                </label>
                <Input
                  type="datetime-local"
                  value={model.expiresAt || ""}
                  onChange={(e) =>
                    setModel({ ...model, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <div className="mt-2">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="preview"
                    className="max-h-40 rounded"
                  />
                ) : model.image_url ? (
                  <img
                    src={model.image_url}
                    alt="campaign"
                    className="max-h-40 rounded"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={onSave} disabled={busy || !canSave}>
                {busy ? "Saving..." : "Save Campaign"}
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={busy || !selectedId}
              >
                Delete Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
