'use client';

import { useMemo, useRef, useState } from 'react';
import { MenuItemCard } from './MenuItemCard';
import { ItemModal } from './ItemModal';
import type { Category, MenuItem } from '@/types';

export function MenuExperience({
  categories,
  currency,
  cafeName,
}: {
  categories: Category[];
  currency: string;
  cafeName: string;
}) {
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query]);

  const scrollToCategory = (slug: string) => {
    const el = sectionRefs.current[slug];
    if (!el) return;
    const headerOffset = 116; // sticky header + category bar
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <main>
      <div className="border-b border-gold-500/10 bg-ink-950 px-5 pb-4 pt-6 sm:px-8">
        <h1 className="font-display text-3xl text-parchment sm:text-4xl">Menu</h1>
        <p className="mt-1 text-sm text-parchment/50">{cafeName}</p>

        <div className="relative mt-5">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu"
            aria-label="Search the menu"
            className="w-full rounded-xl2 border border-gold-500/15 bg-ink-900 py-2.5 pl-10 pr-4 text-sm text-parchment placeholder:text-parchment/35 focus:border-gold-500/40"
          />
        </div>
      </div>

      {/* Sticky horizontal category bar — the priority mobile pattern for a QR-code menu */}
      {!query && (
        <div className="sticky top-[57px] z-30 border-b border-gold-500/10 bg-ink-950/95 backdrop-blur">
          <div
            className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-3 sm:px-8"
            role="tablist"
            aria-label="Menu categories"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                onClick={() => scrollToCategory(cat.slug)}
                className="shrink-0 whitespace-nowrap rounded-full border border-gold-500/20 px-4 py-1.5 text-sm text-parchment/70 transition-colors hover:border-gold-500/50 hover:text-gold-200"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {filteredCategories.length === 0 && (
          <p className="py-16 text-center text-sm text-parchment/50">
            No items match &ldquo;{query}&rdquo;. Try a different search.
          </p>
        )}

        {filteredCategories.map((cat) => (
          <section
            key={cat.id}
            id={cat.slug}
            ref={(el) => {
              sectionRefs.current[cat.slug] = el;
            }}
            className="mb-10 scroll-mt-28"
          >
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="font-display text-2xl text-gold-200">{cat.name}</h2>
              <div className="hairline flex-1" />
            </div>
            <div className="grid gap-3">
              {cat.items.map((item) => (
                <MenuItemCard key={item.id} item={item} currency={currency} onSelect={() => setActiveItem(item)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {activeItem && <ItemModal item={activeItem} currency={currency} onClose={() => setActiveItem(null)} />}
    </main>
  );
}
