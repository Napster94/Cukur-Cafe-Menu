import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ category });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const itemCount = await prisma.menuItem.count({ where: { categoryId: params.id } });
  if (itemCount > 0) {
    return NextResponse.json(
      { error: `This category has ${itemCount} item(s). Move or delete them first.` },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
