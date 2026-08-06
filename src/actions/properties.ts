'use server';

import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAgentOrAdmin } from '@/lib/session';
import { AdminError } from '@/lib/admin/errors';
import * as propertiesCore from '@/lib/admin/properties';
import { ActionResult, zodFieldErrors } from '@/lib/action-result';

/** Public pages are ISR-cached (properties/[slug], properties, home) — refresh them in-process, no webhook needed. */
function revalidatePublicPropertyPaths(slug?: string) {
  revalidatePath('/properties');
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/properties/${slug}`);
}

export async function createPropertyAction(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const actor = await requireAgentOrAdmin();
  try {
    const property = await propertiesCore.createProperty(input, actor);
    revalidatePath('/admin/properties');
    revalidatePublicPropertyPaths(property.slug);
    return { ok: true, message: 'Property created.', data: { id: property.id, slug: property.slug } };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function updatePropertyAction(id: string, input: unknown): Promise<ActionResult> {
  const actor = await requireAgentOrAdmin();
  try {
    const property = await propertiesCore.updateProperty(id, input, actor);
    revalidatePath('/admin/properties');
    revalidatePath(`/admin/properties/${id}`);
    revalidatePublicPropertyPaths(property.slug);
    return { ok: true, message: 'Property updated.' };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function deletePropertyAction(id: string): Promise<ActionResult> {
  const actor = await requireAgentOrAdmin();
  try {
    const property = await propertiesCore.softDeleteProperty(id, actor);
    revalidatePath('/admin/properties');
    revalidatePublicPropertyPaths(property.slug);
    return { ok: true, message: 'Property deleted.' };
  } catch (error) {
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}
