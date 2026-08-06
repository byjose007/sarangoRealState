'use server';

import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/session';
import { AdminError } from '@/lib/admin/errors';
import * as agentsCore from '@/lib/admin/agents';
import { ActionResult, zodFieldErrors } from '@/lib/action-result';

/** Public pages are ISR-cached (agents/[slug], agents, about, home) — refresh them in-process, no webhook needed. */
function revalidatePublicAgentPaths(slug?: string) {
  revalidatePath('/agents');
  revalidatePath('/about');
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/agents/${slug}`);
}

export async function createAgentAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const actor = await requireAdmin();
  try {
    const agent = await agentsCore.createAgent(input, actor);
    revalidatePath('/admin/agents');
    revalidatePublicAgentPaths(agent.slug);
    return { ok: true, message: 'Agent created.', data: { id: agent.id } };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function updateAgentAction(id: string, input: unknown): Promise<ActionResult> {
  const actor = await requireAdmin();
  try {
    const agent = await agentsCore.updateAgent(id, input, actor);
    revalidatePath('/admin/agents');
    revalidatePath(`/admin/agents/${id}`);
    revalidatePublicAgentPaths(agent.slug);
    return { ok: true, message: 'Agent updated.' };
  } catch (error) {
    if (error instanceof ZodError) return { ok: false, message: 'Check the highlighted fields.', fieldErrors: zodFieldErrors(error) };
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function deleteAgentAction(id: string): Promise<ActionResult> {
  const actor = await requireAdmin();
  try {
    const agent = await agentsCore.softDeleteAgent(id, actor);
    revalidatePath('/admin/agents');
    revalidatePublicAgentPaths(agent.slug);
    return { ok: true, message: 'Agent deleted.' };
  } catch (error) {
    if (error instanceof AdminError) return { ok: false, message: error.message };
    throw error;
  }
}
