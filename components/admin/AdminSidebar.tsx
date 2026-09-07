'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CafeMark } from '@/components/customer/CafeMark';

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/menu-items', label: 'Menu Items' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5">
        <CafeMark className="h-7 w-7" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Çukur Café</p>
          <p className="text-xs text-slate-400">Admin dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4">
        <p className="truncate text-xs text-slate-500">Signed in as</p>
        <p className="truncate text-sm font-medium text-slate-800">{adminName}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Log out
        </button>
        <Link href="/menu" target="_blank" className="mt-2 block text-center text-xs text-slate-400 hover:text-slate-600">
          View live menu ↗
        </Link>
      </div>
    </aside>
  );
}
