'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import type { MenuItem } from '@/types';

export function MenuItemCard({
  item,
  currency,
  onSelect,
}: {
  item: MenuItem;
  currency: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-center gap-4 rounded-xl2 border border-gold-500/10 bg-ink-900 p-3 text-left shadow-card transition-colors duration-200 hover:border-gold-500/30 focus-visible:border-gold-500/30 sm:p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-800 sm:h-20 sm:w-20">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gold-500/30">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19l5-6 4 4 3-4 4 5H4z" strokeLinejoin="round" />
              <circle cx="9" cy="8" r="1.6" />
              <rect x="3" y="4" width="18" height="16" rx="2" />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-display text-base text-parchment sm:text-lg">{item.name}</h3>
          <span className="shrink-0 font-display text-base text-gold-300 sm:text-lg">
            {formatPrice(item.price, currency)}
          </span>
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-parchment/50">{item.description}</p>
        )}
        {(item.popular || item.isNew) && (
          <div className="mt-1.5 flex gap-1.5">
            {item.popular && (
              <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] font-medium text-gold-300">
                Popular
              </span>
            )}
            {item.isNew && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                New
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
