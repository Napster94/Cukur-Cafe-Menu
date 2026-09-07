import fs from 'fs/promises';
import Image from 'next/image';
import { UPLOADS_DIR } from '@/lib/paths';

async function getUploadedImages() {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    return files.filter((f) => !f.startsWith('.')).map((f) => `/api/uploads/${f}`).reverse();
  } catch {
    return [];
  }
}

export default async function AdminMediaPage() {
  const images = await getUploadedImages();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Media</h1>
      <p className="mt-1 text-sm text-slate-500">
        Images uploaded through the menu item form. Upload new images from the item editor.
      </p>

      {images.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          No images uploaded yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
