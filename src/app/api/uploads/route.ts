import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAgentOrAdmin } from '@/lib/session';
import { AdminError } from '@/lib/admin/errors';
import { prisma } from '@/lib/prisma';
import * as propertiesCore from '@/lib/admin/properties';
import {
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  UploadError,
  deleteUploadedFileByUrl,
  extensionForDocument,
  extensionForImage,
  formatFileSize,
  saveUploadedFile,
} from '@/lib/uploads';

/** Public property page is ISR-cached — refresh it in-process, no webhook needed. */
function revalidatePublicPropertyPaths(slug: string) {
  revalidatePath('/properties');
  revalidatePath(`/properties/${slug}`);
}

export async function POST(request: NextRequest) {
  const actor = await requireAgentOrAdmin();
  const formData = await request.formData();
  const file = formData.get('file');
  const propertyId = formData.get('propertyId');
  const kind = formData.get('kind');
  const documentName = formData.get('name');

  if (
    !(file instanceof File) ||
    typeof propertyId !== 'string' ||
    !propertyId ||
    (kind !== 'image' && kind !== 'document')
  ) {
    return NextResponse.json({ ok: false, message: 'Invalid upload request.' }, { status: 400 });
  }

  try {
    // Check ownership before touching the filesystem — otherwise a rejected
    // upload (wrong agent, deleted property) still leaves an orphan file on
    // disk since nothing would ever reference it to clean it up later.
    const property = await propertiesCore.assertEditableProperty(propertyId, actor);

    if (kind === 'image') {
      const ext = extensionForImage(file.type, file.name);
      const saved = await saveUploadedFile(file, MAX_IMAGE_BYTES, ext);
      const image = await propertiesCore.addPropertyImage(propertyId, saved.url, actor);
      revalidatePublicPropertyPaths(property.slug);
      return NextResponse.json({ ok: true, data: image });
    }

    const { ext, type } = extensionForDocument(file.type);
    const saved = await saveUploadedFile(file, MAX_DOCUMENT_BYTES, ext);
    const name = typeof documentName === 'string' && documentName ? documentName : file.name;
    const document = await propertiesCore.addPropertyDocument(
      propertyId,
      { name, type, size: formatFileSize(saved.size), href: saved.url },
      actor,
    );
    revalidatePublicPropertyPaths(property.slug);
    return NextResponse.json({ ok: true, data: document });
  } catch (error) {
    if (error instanceof UploadError)
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    if (error instanceof AdminError)
      return NextResponse.json({ ok: false, message: error.message }, { status: 403 });
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const actor = await requireAgentOrAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const kind = searchParams.get('kind');

  if (!id || (kind !== 'image' && kind !== 'document')) {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  try {
    let propertyId: string;
    if (kind === 'image') {
      const removed = await propertiesCore.removePropertyImage(id, actor);
      await deleteUploadedFileByUrl(removed.url);
      propertyId = removed.propertyId;
    } else {
      const removed = await propertiesCore.removePropertyDocument(id, actor);
      await deleteUploadedFileByUrl(removed.href);
      propertyId = removed.propertyId;
    }
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { slug: true },
    });
    if (property) revalidatePublicPropertyPaths(property.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminError)
      return NextResponse.json({ ok: false, message: error.message }, { status: 403 });
    throw error;
  }
}
