import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative().optional(),
  categoryId: z.string().min(1).optional(),
  image: z.string().optional().nullable(),
  available: z.boolean().optional(),
  popular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  order: z.number().int().optional(),
  dietaryTagIds: z.array(z.string()).optional(),
  allergenIds: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update payload.', details: parsed.error.flatten() }, { status: 400 });
  }

  const { dietaryTagIds, allergenIds, ...data } = parsed.data;

  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: {
      ...data,
      dietaryTags: dietaryTagIds ? { set: dietaryTagIds.map((id) => ({ id })) } : undefined,
      allergens: allergenIds ? { set: allergenIds.map((id) => ({ id })) } : undefined,
    },
    include: { category: true, dietaryTags: true, allergens: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.menuItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
