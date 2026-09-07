'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import type { MenuItem } from '@/types';

export function ItemModal({
  item,
  currency,
  onClose,
}: {
  item: MenuItem;
  currency: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-gold-500/15 bg-ink-900 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 w-full bg-ink-800 sm:h-64">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill sizes="512px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gold-500/20">
              <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M4 19l5-6 4 4 3-4 4 5H4z" strokeLinejoin="round" />
                <circle cx="9" cy="8" r="1.6" />
                <rect x="3" y="4" width="18" height="16" rx="2" />
              </svg>
            </div>
          )}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close item details"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/80 text-parchment transition-colors hover:bg-ink-950"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="item-modal-title" className="font-display text-2xl text-parchment">
              {item.name}
            </h2>
            <span className="shrink-0 font-display text-2xl text-gold-300">
              {formatPrice(item.price, currency)}
            </span>
          </div>

          {(item.popular || item.isNew) && (
            <div className="mt-2 flex gap-1.5">
              {item.popular && (
                <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-xs font-medium text-gold-300">
                  Popular
                </span>
              )}
              {item.isNew && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  New
                </span>
              )}
            </div>
          )}

          {item.description && (
            <p className="mt-4 text-sm leading-relaxed text-parchment/70">{item.description}</p>
          )}

          {item.dietaryTags.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs uppercase tracking-wider text-parchment/40">Dietary</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.dietaryTags.map((tag) => (
                  <span key={tag.id} className="rounded-full border border-gold-500/25 px-2.5 py-1 text-xs text-gold-200">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.allergens.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-wider text-parchment/40">Contains</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.allergens.map((a) => (
                  <span key={a.id} className="rounded-full border border-parchment/15 px-2.5 py-1 text-xs text-parchment/60">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
