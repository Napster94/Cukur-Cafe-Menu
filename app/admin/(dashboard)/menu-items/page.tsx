'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/admin/Toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { MenuItemFormModal } from '@/components/admin/MenuItemFormModal';
import { formatPrice } from '@/lib/format';
import type { Category, MenuItem } from '@/types';

export default function AdminMenuItemsPage() {
  return (
    <Suspense fallback={null}>
      <MenuItemsContent />
    </Suspense>
  );
}

function MenuItemsContent() {
  const { show } = useToast();
  const params = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(params.get('new') === '1');
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  async function load() {
    const [catData, itemData] = await Promise.all([
      api.get<{ categories: Category[] }>('/api/categories?all=1'),
      api.get<{ items: MenuItem[] }>('/api/menu-items'),
    ]);
    setCategories(catData.categories);
    setItems(itemData.items);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, categoryFilter, search]);

  async function toggleAvailable(item: MenuItem) {
    setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)) ?? null);
    try {
      await api.patch(`/api/menu-items/${item.id}`, { available: !item.available });
    } catch {
      show('Failed to update availability.', 'error');
      load();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/menu-items/${deleteTarget.id}`);
      show('Menu item deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to delete item.', 'error');
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Menu Items</h1>
          <p className="mt-1 text-sm text-slate-500">{items?.length ?? 0} items total.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add item
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {items === null && <div className="p-6 text-sm text-slate-400">Loading…</div>}
        {items !== null && filtered.length === 0 && (
          <div className="p-6 text-sm text-slate-400">No menu items match your filters.</div>
        )}
        {filtered.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <div className="flex gap-1">
                        {item.popular && <span className="text-xs text-amber-600">Popular</span>}
                        {item.isNew && <span className="text-xs text-emerald-600">New</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {categories.find((c) => c.id === item.categoryId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatPrice(item.price, '$')}</td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={item.available} onChange={() => toggleAvailable(item)} />
                      <span className={item.available ? 'text-emerald-600' : 'text-slate-400'}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                      className="mr-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <MenuItemFormModal
          categories={categories}
          item={editingItem}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            show(editingItem ? 'Changes saved successfully.' : 'Menu item created.');
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete menu item?"
        message={`This will permanently delete "${deleteTarget?.name}".`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
