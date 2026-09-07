import type { Metadata } from 'next';
import './globals.css';
import { getSettings } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.name} — ${settings.tagline ?? 'Menu'}`;
  const description =
    settings.description ??
    `Browse the full menu at ${settings.name}. Coffee, drinks, food, and more.`;

  return {
    title: {
      default: title,
      template: `%s · ${settings.name}`,
    },
    description,
    openGraph: {
      title,
      description,
      siteName: settings.name,
      type: 'website',
      images: settings.logoUrl ? [{ url: settings.logoUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-body">
      <body className="min-h-screen bg-ink-950 text-parchment antialiased">{children}</body>
    </html>
  );
}
