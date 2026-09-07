import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { UPLOADS_DIR } from '@/lib/paths';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, or WebP images are allowed.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be smaller than 8MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(UPLOADS_DIR, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(UPLOADS_DIR, filename);

  // Normalize to a consistent aspect-friendly size and format so the menu grid
  // stays visually consistent regardless of what staff upload.
  await sharp(buffer)
    .resize(1000, 1000, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(filepath);

  // Served by app/api/uploads/[filename]/route.ts, not Next's static /public
  // folder — that keeps images on the same persistent volume as the database,
  // which matters on hosts with an ephemeral app filesystem (see README).
  const publicUrl = `/api/uploads/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
