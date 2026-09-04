import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
const PUBLIC_BASE = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || '/uploads';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export class UploadError extends Error {}

const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/jfif': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const DOCUMENT_TYPE_BY_MIME: Record<string, { ext: string; type: 'PDF' | 'DWG' | 'ZIP' }> = {
  'application/pdf': { ext: 'pdf', type: 'PDF' },
  'application/acad': { ext: 'dwg', type: 'DWG' },
  'image/vnd.dwg': { ext: 'dwg', type: 'DWG' },
  'application/zip': { ext: 'zip', type: 'ZIP' },
  'application/x-zip-compressed': { ext: 'zip', type: 'ZIP' },
};

export function extensionForImage(mimeType: string, filename?: string): string {
  const normalizedMime = mimeType?.toLowerCase()?.trim();
  if (normalizedMime && IMAGE_EXTENSION_BY_MIME[normalizedMime]) {
    return IMAGE_EXTENSION_BY_MIME[normalizedMime];
  }
  if (filename) {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex !== -1) {
      const fileExt = filename.slice(dotIndex + 1).toLowerCase();
      if (fileExt === 'jpeg' || fileExt === 'jpg' || fileExt === 'jpe' || fileExt === 'jfif') {
        return 'jpg';
      }
      if (fileExt === 'png') return 'png';
      if (fileExt === 'webp') return 'webp';
      if (fileExt === 'avif') return 'avif';
    }
  }
  throw new UploadError(`Unsupported image type: ${mimeType || 'unknown'}`);
}

export function extensionForDocument(mimeType: string): {
  ext: string;
  type: 'PDF' | 'DWG' | 'ZIP';
} {
  const match = DOCUMENT_TYPE_BY_MIME[mimeType];
  if (!match) throw new UploadError(`Unsupported document type: ${mimeType || 'unknown'}`);
  return match;
}

export async function saveUploadedFile(file: File, maxBytes: number, ext: string) {
  if (file.size > maxBytes) {
    throw new UploadError(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
  }
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  // UPLOADS_DIR is a runtime env var, not a static path — without this hint
  // Turbopack can't narrow it and traces the whole project into the output.
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename), buffer);
  return { filename, url: `${PUBLIC_BASE}/${filename}`, size: file.size };
}

/** Best-effort — a missing file on disk should never block the DB cleanup. */
export async function deleteUploadedFileByUrl(url: string) {
  const filename = url.split('/').pop();
  if (!filename) return;
  await unlink(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename)).catch(() => {});
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
