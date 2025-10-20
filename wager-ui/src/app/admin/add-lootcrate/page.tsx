"use client";
import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/adminApi';

export default function AddLootCratePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function onImageChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setImagePreview(String(e.target?.result || ''));
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminApi.form<{ url?: string; error?: string }>(`/upload`, fd);
      if (res?.url) setImageUrl(`/images/${res.url}`);
      else setMsg(res?.error || 'Failed to upload image');
    } catch (e: any) { setMsg(e?.message || 'Failed to upload image'); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      const body: any = {
        name,
        description,
        price: price === '' ? undefined : parseFloat(price),
        stock: stock === '' ? undefined : parseInt(stock),
        image_url: imageUrl || undefined,
      };
      const res = await adminApi.post<any>(`/admin/add-loot-crate`, body);
      setMsg(res?.message || 'Loot crate created');
      setName(''); setDescription(''); setPrice(''); setStock(''); setImageUrl(''); setImagePreview('');
    } catch (e: any) { setMsg(e?.message || 'Failed to submit crate'); }
    finally { setBusy(false); }
  }

  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-112px)] w-full px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminTopBar title="Add Loot Crate" />
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Crate Name</label>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Crate name" required />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 min-h-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Price (VSChips)</label>
                <Input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Stock</label>
                <Input type="number" value={stock} onChange={e=>setStock(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Crate Image</label>
              <input type="file" accept="image/*" onChange={(e)=>onImageChange(e.target.files?.[0] || null)} />
              {imagePreview && (<img src={imagePreview} alt="Preview" className="mt-3 max-h-48 rounded" />)}
            </div>
            {msg && (<div className="text-sm text-white/80">{msg}</div>)}
            <div className="pt-2">
              <Button type="submit" disabled={busy || !name} className="w-full md:w-auto">{busy? 'Creating...' : 'Create Crate'}</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
