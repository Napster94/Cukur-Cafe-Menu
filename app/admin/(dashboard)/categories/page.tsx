'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/admin/Toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { show } = useToast();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function load() {
    const data = await api.get<{ categories: Category[] }>('/api/categories?all=1');
    setCategories(data.categories);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post('/api/categories', { name: newName.trim() });
      setNewName('');
      show('Category created.');
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to create category.', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await api.patch(`/api/categories/${cat.id}`, { active: !cat.active });
      show(cat.active ? 'Category hidden from menu.' : 'Category shown on menu.');
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to update category.', 'error');
    }
  }

  async function saveRename(cat: Category) {
    if (!editingName.trim() || editingName.trim() === cat.name) {
      setEditingId(null);
      return;
    }
    try {
      await api.patch(`/api/categories/${cat.id}`, { name: editingName.trim() });
      show('Category renamed.');
      setEditingId(null);
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to rename category.', 'error');
    }
  }

  async function move(cat: Category, direction: -1 | 1) {
    if (!categories) return;
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((c) => c.id === cat.id);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    setCategories(reordered);
    try {
      await api.post('/api/categories/reorder', { order: reordered.map((c) => c.id) });
    } catch (err) {
      show('Failed to save new order.', 'error');
      await load();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/categories/${deleteTarget.id}`);
      show('Category deleted.');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to delete category.', 'error');
      setDeleteTarget(null);
    }
  }

  const sorted = categories ? [...categories].sort((a, b) => a.order - b.order) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">
        Order here determines the order customers see on the menu.
      </p>

      <form onSubmit={createCategory} className="mt-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name, e.g. Desserts"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Add category
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {categories === null && <div className="p-6 text-sm text-slate-400">Loading…</div>}
        {categories !== null && sorted.length === 0 && (
          <div className="p-6 text-sm text-slate-400">No categories yet. Add your first one above.</div>
        )}
        <ul className="divide-y divide-slate-100">
          {sorted.map((cat, i) => (
            <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => move(cat, -1)}
                  className="text-slate-400 hover:text-slate-800 disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  aria-label="Move down"
                  disabled={i === sorted.length - 1}
                  onClick={() => move(cat, 1)}
                  className="text-slate-400 hover:text-slate-800 disabled:opacity-20"
                >
                  ▼
                </button>
              </div>

              <div className="min-w-0 flex-1">
                {editingId === cat.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => saveRename(cat)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename(cat)}
                    className="w-full max-w-xs rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditingName(cat.name);
                    }}
                    className="text-sm font-medium text-slate-800 hover:text-slate-950"
                  >
                    {cat.name}
                  </button>
                )}
                <p className="text-xs text-slate-400">{cat.items.length} item(s)</p>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={cat.active} onChange={() => toggleActive(cat)} className="h-4 w-4" />
                Visible
              </label>

              <button
                onClick={() => setDeleteTarget(cat)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        message={`This will permanently delete "${deleteTarget?.name}". You can only delete categories with no items.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
