import type { ZodError } from 'zod';

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = String(issue.path[0] ?? 'form');
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}
