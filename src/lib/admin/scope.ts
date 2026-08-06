import type { UserRole } from '@/generated/prisma/enums';

export interface Actor {
  id: string;
  role: UserRole;
  agentId: string | null;
}

/**
 * ADMIN sees everything; AGENT is scoped to records owned by their own
 * agentId. Spread the result into a Prisma `where` clause. An AGENT user
 * with no linked Agent profile matches nothing (`id: '__none__'`) rather
 * than silently falling through to an unscoped query.
 */
export function agentScopeWhere(actor: Actor): { agentId?: string; id?: string } {
  if (actor.role === 'ADMIN') return {};
  if (!actor.agentId) return { id: '__none__' };
  return { agentId: actor.agentId };
}
