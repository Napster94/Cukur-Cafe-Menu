import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  order: z.array(z.string()), // array of menu item ids in new order, within one category
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reorder payload.' }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.order.map((id, index) =>
      prisma.menuItem.update({ where: { id }, data: { order: index } }),
    ),
  );

  return NextResponse.json({ success: true });
}
