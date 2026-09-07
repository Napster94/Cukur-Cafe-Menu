import Link from 'next/link';
import { getSettings, parseHours } from '@/lib/data';
import { SiteHeader } from '@/components/customer/SiteHeader';
import { SiteFooter } from '@/components/customer/SiteFooter';
import { CafeMark } from '@/components/customer/CafeMark';
import { SkylineSilhouette } from '@/components/customer/SkylineSilhouette';

export default async function HomePage() {
  const settings = await getSettings();
  const hours = parseHours(settings.hours);
  const today = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] as
    | 'sun'
    | 'mon'
    | 'tue'
    | 'wed'
    | 'thu'
    | 'fri'
    | 'sat';
  const todayHours = hours?.[today];

  return (
    <>
      <SiteHeader settings={settings} />

      <main>
        {/* Hero — the printed menu's own emblem, blown up, is the most characteristic
            thing in this cafe's world, so it leads. One entrance animation, nothing more. */}
        <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.12),transparent_60%)]" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="animate-[fadeUp_0.7s_ease-out]">
              <CafeMark className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
              <h1 className="mt-6 font-display text-5xl leading-none text-gold-foil sm:text-7xl">
                {settings.name}
              </h1>
              {settings.tagline && (
                <p className="mt-5 text-base text-parchment/70 sm:text-lg">{settings.tagline}</p>
              )}
              <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/menu"
                  className="w-full rounded-xl2 bg-gold-foil px-8 py-3.5 text-center font-medium text-ink-950 shadow-card transition-transform duration-200 hover:scale-[1.02] sm:w-auto"
                >
                  View the menu
                </Link>
                {settings.address && (
                  <span className="text-sm text-parchment/50">{settings.address}</span>
                )}
              </div>
              {todayHours && (
                <p className="mt-4 text-xs uppercase tracking-wider text-parchment/40">
                  Open today &middot; {todayHours}
                </p>
              )}
            </div>
          </div>
        </section>

        <SkylineSilhouette className="h-14 w-full opacity-80" />

        {/* Short, concrete intro — coffee, food, drinks and a few tabletop games,
            matching what's actually on the printed menu. */}
        <section className="border-t border-gold-500/10 bg-ink-900 px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            <div>
              <h2 className="font-display text-xl text-gold-200">Coffee &amp; hot drinks</h2>
              <p className="mt-2 text-sm leading-relaxed text-parchment/60">
                Rakwa coffee, cappuccino, and hot chocolate, brewed the way regulars expect.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl text-gold-200">Food &amp; plates</h2>
              <p className="mt-2 text-sm leading-relaxed text-parchment/60">
                Manakish, sandwiches, and shared plates — simple food, done well.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl text-gold-200">Drinks &amp; a few games</h2>
              <p className="mt-2 text-sm leading-relaxed text-parchment/60">
                Fresh juice, milkshakes, and a full bar, with chess, cards, and dice on hand.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 text-center sm:px-8">
          <p className="font-display text-2xl text-parchment/80 sm:text-3xl">Scan the code on your table,</p>
          <p className="font-display text-2xl text-gold-300 sm:text-3xl">or just tap the button below.</p>
          <Link
            href="/menu"
            className="mt-7 inline-block rounded-xl2 border border-gold-500/40 px-8 py-3.5 font-medium text-gold-200 transition-colors hover:bg-gold-500/10"
          >
            Browse the full menu
          </Link>
        </section>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
