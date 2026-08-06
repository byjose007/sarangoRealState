import { prisma } from '@/lib/prisma';
import { logActivity } from './activity';
import { AdminError } from './errors';
import type { Actor } from './scope';
import { createClientSchema, updateClientSchema } from '@/lib/validation-admin';

/** A client isn't owned by an agentId directly — scope via their leads. */
function clientScopeWhere(actor: Actor) {
  if (actor.role === 'ADMIN') return {};
  if (!actor.agentId) return { id: '__none__' };
  return { leads: { some: { assignedAgentId: actor.agentId } } };
}

export async function listClients(actor: Actor) {
  return prisma.client.findMany({ where: clientScopeWhere(actor), orderBy: { createdAt: 'desc' } });
}

export async function getClient(id: string, actor: Actor) {
  const client = await prisma.client.findFirst({
    where: { id, ...clientScopeWhere(actor) },
    include: { leads: { orderBy: { createdAt: 'desc' } } },
  });
  if (!client) throw new AdminError('Client not found.');
  return client;
}

export async function createClient(input: unknown, actor: Actor) {
  const parsed = createClientSchema.parse(input);
  const client = await prisma.client.create({
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone || null,
      notes: parsed.notes || null,
      source: 'MANUAL',
    },
  });
  await logActivity({ entityType: 'CLIENT', entityId: client.id, action: 'CREATED', actorUserId: actor.id });
  return client;
}

export async function updateClient(id: string, input: unknown, actor: Actor) {
  const existing = await prisma.client.findFirst({ where: { id, ...clientScopeWhere(actor) } });
  if (!existing) throw new AdminError('Client not found or you do not have permission to edit it.');

  const parsed = updateClientSchema.parse(input);
  const client = await prisma.client.update({ where: { id }, data: parsed });
  await logActivity({
    entityType: 'CLIENT',
    entityId: client.id,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: parsed,
  });
  return client;
}
