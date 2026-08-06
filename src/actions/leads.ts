'use server';

import { agentMessageSchema, contactSchema, viewingSchema } from '@/lib/validation';
import { createLeadFromAgentMessage, createLeadFromContact, createLeadFromViewing } from '@/lib/leads-intake';

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

function toFieldErrors(error: { issues: { path: (string | number)[]; message: string }[] }) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = String(issue.path[0] ?? 'form');
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

export async function requestViewing(input: unknown): Promise<ActionResult> {
  const parsed = viewingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) };
  }
  try {
    await createLeadFromViewing(parsed.data);
  } catch (error) {
    console.error('requestViewing failed', error);
    return { ok: false, message: 'Something went wrong. Please try again.' };
  }
  return {
    ok: true,
    message: `Viewing requested for ${parsed.data.date} at ${parsed.data.time}. An agent confirms within two working hours.`,
  };
}

export async function sendContactMessage(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) };
  }
  try {
    await createLeadFromContact(parsed.data);
  } catch (error) {
    console.error('sendContactMessage failed', error);
    return { ok: false, message: 'Something went wrong. Please try again.' };
  }
  return { ok: true, message: 'Message sent. The desk replies the same working day.' };
}

export async function messageAgent(input: unknown, agentId: string): Promise<ActionResult> {
  const parsed = agentMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) };
  }
  try {
    await createLeadFromAgentMessage(parsed.data, agentId);
  } catch (error) {
    console.error('messageAgent failed', error);
    return { ok: false, message: 'Something went wrong. Please try again.' };
  }
  return { ok: true, message: 'Sent. Your agent has the details.' };
}
