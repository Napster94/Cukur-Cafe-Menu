import Link from 'next/link';
import { CafeMark } from './CafeMark';
import { parseHours } from '@/lib/data';
import type { CafeSettings } from '@/types';

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function SiteFooter({ settings }: { settings: CafeSettings }) {
  const hours = parseHours(settings.hours);

  return (
    <footer className="border-t border-gold-500/15 bg-ink-900">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <CafeMark className="h-8 w-8" />
              <span className="font-display text-lg text-parchment">{settings.name}</span>
            </div>
            {settings.description && (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-parchment/60">{settings.description}</p>
            )}
            <div className="mt-4 flex gap-4 text-sm">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-gold-300 hover:text-gold-200">
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="text-gold-300 hover:text-gold-200">
                  Facebook
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-base text-gold-200">Visit us</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-parchment/70">
              {settings.address && <li>{settings.address}</li>}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="hover:text-gold-200">
                    {settings.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {hours && (
            <div>
              <h3 className="font-display text-base text-gold-200">Opening hours</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-parchment/70">
                {Object.entries(hours).map(([day, range]) => (
                  <li key={day} className="flex justify-between gap-6">
                    <span>{DAY_LABELS[day] ?? day}</span>
                    <span className="text-parchment/50">{range}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="hairline mt-10" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-parchment/40 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <Link href="/admin/login" className="hover:text-parchment/70">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
