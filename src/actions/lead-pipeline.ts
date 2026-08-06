'use server';

import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireAgentOrAdmin } from '@/lib/session';
import { AdminError } from '@/lib/admin/errors';
import * as leadsCore from '@/lib/admin/leads';
import { ActionResult, zodFieldErrors } from '@/lib/action-result';

export async function createLeadAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const actor = await requireAgentOrAdmin();
  try {
    const lead = await leadsCore.createLead(input, actor);
    revalidatePath('/admin/leads');
    return { ok: true, message: 'Lead created.', data: { id: lead.id } };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function updateLeadStageAction(id: string, stage: unknown): Promise<ActionResult> {
  const actor = await requireAgentOrAdmin();
  try {
    await leadsCore.updateLeadStage(id, stage, actor);
    revalidatePath('/admin/leads');
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true, message: 'Stage updated.' };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Invalid stage.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function assignLeadAction(id: string, agentId: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  try {
    await leadsCore.assignLead(id, agentId, actor);
    revalidatePath('/admin/leads');
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true, message: 'Lead reassigned.' };
  } catch (error) {
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function addLeadNoteAction(id: string, body: unknown): Promise<ActionResult> {
  const actor = await requireAgentOrAdmin();
  try {
    await leadsCore.addLeadNote(id, body, actor);
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true, message: 'Note added.' };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}
