'use server';

import { agentMessageSchema, contactSchema, viewingSchema } from '@/lib/validation';
import {
  createLeadFromAgentMessage,
  createLeadFromContact,
  createLeadFromViewing,
} from '@/lib/leads-intake';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

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

// One shared bucket across all three public lead forms — they're all the
// same abuse vector (a script hammering the site to fill the leads table),
// so a visitor genuinely using more than one of them in 15 minutes is rare
// enough to not worry about separate limits per form.
const LEAD_LIMIT = 8;
const LEAD_WINDOW_MS = 15 * 60 * 1000;

async function checkLeadRateLimit(): Promise<ActionResult | null> {
  const ip = await getClientIp();
  const { ok, retryAfterSeconds } = rateLimit(`lead:${ip}`, LEAD_LIMIT, LEAD_WINDOW_MS);
  if (ok) return null;
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return {
    ok: false,
    message: `Too many requests. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
  };
}

export async function requestViewing(input: unknown): Promise<ActionResult> {
  const limited = await checkLeadRateLimit();
  if (limited) return limited;

  const parsed = viewingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Check the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
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
  const limited = await checkLeadRateLimit();
  if (limited) return limited;

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Check the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
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
  const limited = await checkLeadRateLimit();
  if (limited) return limited;

  const parsed = agentMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Check the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  try {
    await createLeadFromAgentMessage(parsed.data, agentId);
  } catch (error) {
    console.error('messageAgent failed', error);
    return { ok: false, message: 'Something went wrong. Please try again.' };
  }
  return { ok: true, message: 'Sent. Your agent has the details.' };
}
