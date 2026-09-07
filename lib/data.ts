import { prisma } from './prisma';

export { formatPrice, parseHours } from './format';

export async function getSettings() {
  const settings = await prisma.cafeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings as any;
}

export async function getPublicCategories() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    include: {
      items: {
        where: { available: true },
        orderBy: { order: 'asc' },
      },
    },
  });
  // Hide empty categories from the customer-facing site.
  return (categories as any[]).filter((c) => c.items.length > 0);
}
