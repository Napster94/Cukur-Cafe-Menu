import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const allergens = await prisma.allergen.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ allergens });
}

const schema = z.object({ name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Allergen name is required.' }, { status: 400 });
  }
  const allergen = await prisma.allergen.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });
  return NextResponse.json({ allergen }, { status: 201 });
}
