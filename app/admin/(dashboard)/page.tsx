import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getStats() {
  const [totalItems, totalCategories, available, unavailable, popular, recent] = await Promise.all([
    prisma.menuItem.count(),
    prisma.category.count(),
    prisma.menuItem.count({ where: { available: true } }),
    prisma.menuItem.count({ where: { available: false } }),
    prisma.menuItem.count({ where: { popular: true } }),
    prisma.menuItem.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { category: true } }),
  ]);
  return { totalItems, totalCategories, available, unavailable, popular, recent };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Total menu items', value: stats.totalItems },
    { label: 'Categories', value: stats.totalCategories },
    { label: 'Available now', value: stats.available },
    { label: 'Unavailable', value: stats.unavailable },
    { label: 'Marked popular', value: stats.popular },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">A quick look at your menu.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-semibold text-slate-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recently added items</h2>
            <Link href="/admin/menu-items" className="text-xs font-medium text-slate-500 hover:text-slate-900">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {stats.recent.length === 0 && <li className="py-3 text-sm text-slate-400">No items yet.</li>}
            {stats.recent.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.category.name}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/admin/menu-items?new=1"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
            >
              Add a menu item
            </Link>
            <Link
              href="/admin/categories?new=1"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add a category
            </Link>
            <Link
              href="/menu"
              target="_blank"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Preview live menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
