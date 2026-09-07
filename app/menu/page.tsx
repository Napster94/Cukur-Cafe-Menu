import type { Metadata } from 'next';
import { getPublicCategories, getSettings } from '@/lib/data';
import { SiteHeader } from '@/components/customer/SiteHeader';
import { SiteFooter } from '@/components/customer/SiteFooter';
import { MenuExperience } from '@/components/customer/MenuExperience';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: 'Menu',
    description: `The full menu at ${settings.name} — coffee, drinks, food, and more.`,
  };
}

export default async function MenuPage() {
  const [categories, settings] = await Promise.all([getPublicCategories(), getSettings()]);

  return (
    <>
      <SiteHeader settings={settings} />
      <MenuExperience categories={categories} currency={settings.currency} cafeName={settings.name} />
      <SiteFooter settings={settings} />
    </>
  );
}
