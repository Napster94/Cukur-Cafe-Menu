import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const tags = await prisma.dietaryTag.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ tags });
}

const schema = z.object({ name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Tag name is required.' }, { status: 400 });
  }
  const tag = await prisma.dietaryTag.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });
  return NextResponse.json({ tag }, { status: 201 });
}
