import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

type SeedItem = {
  name: string;
  price: number;
  description?: string;
  popular?: boolean;
};

type SeedCategory = {
  name: string;
  slug: string;
  items: SeedItem[];
};

// Sourced directly from the cafe's printed menu. Descriptions were not on the
// original menu, so placeholders are used where noted — replace from the
// admin dashboard once you have real copy.
const categories: SeedCategory[] = [
  {
    name: 'Hot Drinks',
    slug: 'hot-drinks',
    items: [
      { name: 'Coffee Rakwa', price: 3 },
      { name: 'Coffee', price: 1 },
      { name: 'Tea', price: 1 },
      { name: 'Nescafé / Cappuccino', price: 1 },
      { name: 'Hot Chocolate', price: 1.1 },
      { name: 'Maté', price: 5 },
    ],
  },
  {
    name: 'Milkshakes & Iced',
    slug: 'milkshakes-iced',
    items: [
      { name: 'Frappuccino Caramel', price: 3.3, popular: true },
      { name: 'Iced Latte', price: 2.2 },
      { name: 'Oreo Milkshake', price: 3.3, popular: true },
      { name: 'Iced Chocolate', price: 2 },
      { name: 'Iced Mocca', price: 2 },
    ],
  },
  {
    name: 'Fresh Juice',
    slug: 'fresh-juice',
    items: [
      { name: 'Orange Juice', price: 2.2 },
      { name: 'Avocado', price: 5 },
      { name: 'Mojito', price: 3 },
      { name: 'Kiwi', price: 4 },
      { name: 'Banana & Strawberry', price: 3 },
    ],
  },
  {
    name: 'Drinks',
    slug: 'drinks',
    items: [
      { name: 'Water', price: 0.5 },
      { name: 'XXL', price: 1 },
      { name: 'Dark Blue', price: 1 },
      { name: 'Pacha', price: 2 },
      { name: 'Soft Drink', price: 0.55 },
      { name: 'Iced Tea', price: 1 },
      { name: 'Strawberry Passion', price: 4 },
      { name: 'Mango Berry', price: 4 },
      { name: 'Pink Sunset', price: 4 },
      { name: 'Forest Blue', price: 4.5 },
      { name: 'Rainbow Mix', price: 4.5 },
      { name: 'Crème Brûlée Iced', price: 4 },
    ],
  },
  {
    name: 'Manakish',
    slug: 'manakish',
    items: [
      { name: 'Cheese', price: 2.5 },
      { name: 'Zaatar', price: 1.5 },
      { name: 'Cocktail', price: 2 },
      { name: 'Turkey & Cheese', price: 3 },
    ],
  },
  {
    name: 'Sandwiches',
    slug: 'sandwiches',
    items: [
      { name: 'Tuna Sandwich', price: 3, description: 'Placeholder description — add details in the dashboard.' },
      { name: 'Turkey & Cheese', price: 3 },
      { name: 'Labneh', price: 3 },
      { name: 'Eggs', price: 4 },
    ],
  },
  {
    name: 'Plates',
    slug: 'plates',
    items: [
      {
        name: 'Formule',
        price: 15,
        description: 'Eggs, makdous, labneh, mortadella, jebne, mrabba, butter, tea.',
        popular: true,
      },
    ],
  },
  {
    name: 'Alcohol',
    slug: 'alcohol',
    items: [
      { name: 'Margarita', price: 5 },
      { name: 'Vodka Mojito', price: 4 },
      { name: 'Piña Colada', price: 3.3 },
      { name: 'Sex on the Beach', price: 4 },
      { name: 'Double X', price: 4 },
      { name: 'B-52', price: 6 },
      { name: 'Bloody Mary', price: 5 },
    ],
  },
  {
    name: 'Whiskey',
    slug: 'whiskey',
    items: [
      { name: 'Red Label', price: 3 },
      { name: 'Black Label', price: 4.5 },
      { name: 'Chivas', price: 5 },
      { name: 'Irish Whiskey', price: 6.5 },
    ],
  },
  {
    name: 'Beer & Shots',
    slug: 'beer-shots',
    items: [
      { name: 'Mexican Beer', price: 3 },
      { name: 'Almaza Beer', price: 2 },
      { name: 'Tequila Shot', price: 1 },
      { name: 'Jäger Boom Boom', price: 4.5 },
    ],
  },
  {
    name: 'Tsalla',
    slug: 'tsalla',
    items: [
      { name: 'Chips Basket', price: 1.1 },
      { name: 'Jazar w Hamoud', price: 1.1 },
      { name: 'Bzourat', price: 1.1 },
      { name: 'Nachos', price: 3 },
    ],
  },
];

async function main() {
  console.log('Seeding Çukur Café database...');

  await prisma.cafeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Çukur Café',
      tagline: 'Good Drinks, Good Food, Good Mood',
      description:
        'A relaxed spot for coffee, drinks, and good company. Placeholder description — edit in Settings.',
      address: 'Placeholder address — edit in Settings',
      phone: 'Placeholder phone — edit in Settings',
      hours: JSON.stringify({
        mon: '10:00 - 00:00',
        tue: '10:00 - 00:00',
        wed: '10:00 - 00:00',
        thu: '10:00 - 00:00',
        fri: '10:00 - 01:00',
        sat: '10:00 - 01:00',
        sun: '10:00 - 00:00',
      }),
      instagram: 'https://instagram.com/cukur.cafe',
      facebook: 'https://facebook.com/cukur.cafe',
      currency: '$',
    },
  });

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: i },
      create: { name: cat.name, slug: cat.slug, order: i },
    });

    for (let j = 0; j < cat.items.length; j++) {
      const item = cat.items[j];
      const existing = await prisma.menuItem.findFirst({
        where: { name: item.name, categoryId: category.id },
      });
      if (existing) continue;
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          categoryId: category.id,
          popular: item.popular ?? false,
          order: j,
        },
      });
    }
  }

  const passwordHash = await bcrypt.hash('cukur-admin-2026', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@cukurcafe.com' },
    update: {},
    create: {
      name: 'Café Owner',
      email: 'admin@cukurcafe.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Seed complete.');
  console.log('Admin login -> email: admin@cukurcafe.com / password: cukur-admin-2026');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
