import Link from 'next/link';
import { CafeMark } from './CafeMark';
import type { CafeSettings } from '@/types';

export function SiteHeader({ settings }: { settings: CafeSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/15 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <CafeMark className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display text-lg tracking-wide text-parchment">{settings.name}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/menu" className="text-gold-300 transition-colors hover:text-gold-200">
            View menu
          </Link>
        </nav>
      </div>
    </header>
  );
}
