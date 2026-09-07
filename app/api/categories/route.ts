import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  const includeAll = req.nextUrl.searchParams.get('all') === '1';
  const session = includeAll ? await getSession() : null;

  const categories = await prisma.category.findMany({
    where: includeAll && session ? {} : { active: true },
    orderBy: { order: 'asc' },
    include: {
      items: {
        where: includeAll && session ? {} : { available: true },
        orderBy: { order: 'asc' },
        include: { dietaryTags: true, allergens: true },
      },
    },
  });

  return NextResponse.json({ categories });
}

const createSchema = z.object({
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
