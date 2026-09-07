'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api-client';
import type { Category, DietaryTag, Allergen, MenuItem } from '@/types';

type FormState = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string | null;
  available: boolean;
  popular: boolean;
  isNew: boolean;
  dietaryTagIds: string[];
  allergenIds: string[];
};

const emptyForm = (defaultCategoryId: string): FormState => ({
  name: '',
  description: '',
  price: '',
  categoryId: defaultCategoryId,
  image: null,
  available: true,
  popular: false,
  isNew: false,
  dietaryTagIds: [],
  allergenIds: [],
});

export function MenuItemFormModal({
  categories,
  item,
  onClose,
  onSaved,
}: {
  categories: Category[];
  item: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    item
      ? {
          name: item.name,
          description: item.description ?? '',
          price: String(item.price),
          categoryId: item.categoryId,
          image: item.image,
          available: item.available,
          popular: item.popular,
          isNew: item.isNew,
          dietaryTagIds: item.dietaryTags.map((t) => t.id),
          allergenIds: item.allergens.map((a) => a.id),
        }
      : emptyForm(categories[0]?.id ?? ''),
  );
  const [tags, setTags] = useState<DietaryTag[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ tags: DietaryTag[] }>('/api/dietary-tags').then((d) => setTags(d.tags));
    api.get<{ allergens: Allergen[] }>('/api/allergens').then((d) => setAllergens(d.allergens));
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed.');
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function addTag() {
    if (!newTag.trim()) return;
    const data = await api.post<{ tag: DietaryTag }>('/api/dietary-tags', { name: newTag.trim() });
    setTags((t) => [...t, data.tag].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((f) => ({ ...f, dietaryTagIds: [...f.dietaryTagIds, data.tag.id] }));
    setNewTag('');
  }

  async function addAllergen() {
    if (!newAllergen.trim()) return;
    const data = await api.post<{ allergen: Allergen }>('/api/allergens', { name: newAllergen.trim() });
    setAllergens((a) => [...a, data.allergen].sort((x, y) => x.name.localeCompare(y.name)));
    setForm((f) => ({ ...f, allergenIds: [...f.allergenIds, data.allergen.id] }));
    setNewAllergen('');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = parseFloat(form.price);
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.categoryId) return setError('Choose a category.');
    if (Number.isNaN(price) || price < 0) return setError('Enter a valid price.');

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price,
        categoryId: form.categoryId,
        image: form.image,
        available: form.available,
        popular: form.popular,
        isNew: form.isNew,
        dietaryTagIds: form.dietaryTagIds,
        allergenIds: form.allergenIds,
      };
      if (item) {
        await api.patch(`/api/menu-items/${item.id}`, payload);
      } else {
        await api.post('/api/menu-items', payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{item ? 'Edit item' : 'Add menu item'}</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <label className="text-sm font-medium text-slate-700">Image</label>
            <div className="mt-1 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                {form.image && <Image src={form.image} alt="" fill className="object-cover" />}
              </div>
              <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                {uploading ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700">
              Price
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
              />
              Popular
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
              />
              New
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Dietary tags</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const checked = form.dietaryTagIds.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        dietaryTagIds: checked
                          ? f.dietaryTagIds.filter((id) => id !== tag.id)
                          : [...f.dietaryTagIds, tag.id],
                      }))
                    }
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      checked ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-600'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag, e.g. Vegan"
                className="w-full max-w-[180px] rounded-lg border border-slate-300 px-2 py-1 text-xs"
              />
              <button type="button" onClick={addTag} className="text-xs font-medium text-slate-600 hover:text-slate-900">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Allergens</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {allergens.map((a) => {
                const checked = form.allergenIds.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        allergenIds: checked ? f.allergenIds.filter((id) => id !== a.id) : [...f.allergenIds, a.id],
                      }))
                    }
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      checked ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-600'
                    }`}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                placeholder="Add allergen, e.g. Nuts"
                className="w-full max-w-[180px] rounded-lg border border-slate-300 px-2 py-1 text-xs"
              />
              <button type="button" onClick={addAllergen} className="text-xs font-medium text-slate-600 hover:text-slate-900">
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
