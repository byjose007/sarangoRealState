'use server';

import { requireAgentOrAdmin } from '@/lib/session';
import { ActionResult } from '@/lib/action-result';
import { extensionForImage, MAX_IMAGE_BYTES, saveUploadedFile, UploadError } from '@/lib/uploads';

export async function uploadImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string; filename: string }>> {
  await requireAgentOrAdmin();
  try {
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return { ok: false, message: 'No file uploaded.' };
    }
    const ext = extensionForImage(file.type, file.name);
    const result = await saveUploadedFile(file, MAX_IMAGE_BYTES, ext);
    return {
      ok: true,
      message: 'Image uploaded successfully.',
      data: { url: result.url, filename: result.filename },
    };
  } catch (error) {
    if (error instanceof UploadError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: 'An unexpected error occurred during image upload.' };
  }
}
