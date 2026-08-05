'use server';

import { agentMessageSchema, contactSchema, viewingSchema } from '@/lib/validation';

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function toFieldErrors(error: { issues: { path: (string | number)[]; message: string }[] }) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = String(issue.path[0] ?? 'form');
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

/**
 * Server actions stand in for the CRM. Swap the `wait` call for your own
 * transport (HubSpot, Salesforce, Resend, a database) and the UI is unchanged.
 */
export async function requestViewing(input: unknown): Promise<ActionResult> {
  const parsed = viewingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) };
  }
  await wait(600);
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
  await wait(600);
  return { ok: true, message: 'Message sent. The desk replies the same working day.' };
}

export async function messageAgent(input: unknown): Promise<ActionResult> {
  const parsed = agentMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', fieldErrors: toFieldErrors(parsed.error) };
  }
  await wait(500);
  return { ok: true, message: 'Sent. Your agent has the details.' };
}
