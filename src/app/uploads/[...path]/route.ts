import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// In production, nginx serves /uploads/* directly from the shared volume and
// this route never runs (see nginx/nginx.conf). It exists so uploads render
// correctly in local dev, where there's no reverse proxy in front of Next.

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.dwg': 'application/acad',
  '.zip': 'application/zip',
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const filename = segments.join('/');

  // Uploaded filenames are always flat UUIDs — reject anything that looks
  // like an attempt to traverse out of UPLOADS_DIR.
  if (filename.includes('..') || filename.includes('/')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // UPLOADS_DIR is a runtime env var, not a static path — without this hint
    // Turbopack can't narrow it and traces the whole project into the output.
    const data = await readFile(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename));
    const ext = path.extname(filename).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
