"use client";
import { useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/adminApi";

type Currency = "USD" | "VS" | "SOL" | "VSChips";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [sku, setSku] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [stock, setStock] = useState<string>("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [qtPack, setQtPack] = useState<string>("");
  const [oneTime, setOneTime] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

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
      if (res?.url) setImageUrl(`/images/${res.url}`);
      else setMessage(res?.error || "Failed to upload image");
    } catch (e: any) {
      setMessage(e?.message || "Failed to upload image");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const body: any = {
        name,
        description,
        price: price === "" ? undefined : parseFloat(price),
        sku,
        currency,
        stock: stock === "" ? undefined : parseInt(stock),
        category,
        type,
        qt_pack: qtPack === "" ? undefined : parseInt(qtPack),
        is_active: 1,
        one_time: oneTime ? 1 : 0,
        image_url: imageUrl || undefined,
      };
      const res = await adminApi.post<any>(`/products`, body);
      setMessage(res?.message || "Product saved");
      setName("");
      setDescription("");
      setPrice("");
      setSku("");
      setStock("");
      setCategory("");
      setType("");
      setQtPack("");
      setOneTime(false);
      setImageUrl("");
      setImagePreview("");
    } catch (e: any) {
      setMessage(e?.message || "Failed to save product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Add Product" />
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-24"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Price
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Currency
                </label>
                <select
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD</option>
                  <option value="VS">VS</option>
                  <option value="SOL">SOL</option>
                  <option value="VSChips">VSChips</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">SKU</label>
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Stock
                </label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Category
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Type</label>
                <Input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Type"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Pack Qty
                </label>
                <Input
                  type="number"
                  value={qtPack}
                  onChange={(e) => setQtPack(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  id="one_time"
                  type="checkbox"
                  checked={oneTime}
                  onChange={(e) => setOneTime(e.target.checked)}
                  className="size-4"
                />
                <label htmlFor="one_time" className="text-sm text-white/80">
                  Promotion (one-time)
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Product Image
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
            {message && <div className="text-sm text-white/80">{message}</div>}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={busy || !name}
                className="w-full md:w-auto"
              >
                {busy ? "Submitting..." : "Add Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
