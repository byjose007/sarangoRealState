'use server';

import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAgentOrAdmin } from '@/lib/session';
import { AdminError } from '@/lib/admin/errors';
import * as clientsCore from '@/lib/admin/clients';
import { ActionResult, zodFieldErrors } from '@/lib/action-result';

export async function createClientAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const actor = await requireAgentOrAdmin();
  try {
    const client = await clientsCore.createClient(input, actor);
    revalidatePath('/admin/clients');
    return { ok: true, message: 'Client created.', data: { id: client.id } };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function updateClientAction(id: string, input: unknown): Promise<ActionResult> {
  const actor = await requireAgentOrAdmin();
  try {
    await clientsCore.updateClient(id, input, actor);
    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${id}`);
    return { ok: true, message: 'Client updated.' };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}
