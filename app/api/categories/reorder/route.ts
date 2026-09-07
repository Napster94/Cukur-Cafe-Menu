import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  order: z.array(z.string()), // array of category ids in new order
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reorder payload.' }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.order.map((id, index) =>
      prisma.category.update({ where: { id }, data: { order: index } }),
    ),
  );

  return NextResponse.json({ success: true });
}
