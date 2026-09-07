import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/paths';

export async function GET(_req: NextRequest, { params }: { params: { filename: string } }) {
  // Guard against path traversal — only allow a bare filename, no separators.
  const filename = params.filename;
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return NextResponse.json({ error: 'Invalid filename.' }, { status: 400 });
  }

  const filepath = path.join(UPLOADS_DIR, filename);

  try {
    const data = await readFile(filepath);
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'image/webp',
        // Uploaded files are content-addressed by a random UUID and never
        // overwritten in place, so it's safe to cache them aggressively.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }
}
