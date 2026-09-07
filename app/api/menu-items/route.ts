import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId') ?? undefined;
  const items = await prisma.menuItem.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
    include: { category: true, dietaryTags: true, allergens: true },
  });
  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  categoryId: z.string().min(1),
  image: z.string().optional().nullable(),
  available: z.boolean().optional(),
  popular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  dietaryTagIds: z.array(z.string()).optional(),
  allergenIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid menu item payload.', details: parsed.error.flatten() }, { status: 400 });
  }

  const { dietaryTagIds, allergenIds, ...data } = parsed.data;

  const maxOrder = await prisma.menuItem.aggregate({
    _max: { order: true },
    where: { categoryId: data.categoryId },
  });

  const item = await prisma.menuItem.create({
    data: {
      ...data,
      order: (maxOrder._max.order ?? -1) + 1,
      dietaryTags: dietaryTagIds ? { connect: dietaryTagIds.map((id) => ({ id })) } : undefined,
      allergens: allergenIds ? { connect: allergenIds.map((id) => ({ id })) } : undefined,
    },
    include: { category: true, dietaryTags: true, allergens: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
