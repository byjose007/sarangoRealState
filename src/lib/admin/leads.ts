import { prisma } from '@/lib/prisma';
import { logActivity } from './activity';
import { AdminError } from './errors';
import type { Actor } from './scope';
import { createLeadSchema, leadNoteSchema, leadStageSchema } from '@/lib/validation-admin';
import { notifyAgentLeadAssigned, notifyAgentLeadStageChanged, notifyAgentNewLead } from '@/lib/lead-notifications';

function leadScopeWhere(actor: Actor) {
  if (actor.role === 'ADMIN') return {};
  if (!actor.agentId) return { id: '__none__' };
  return { assignedAgentId: actor.agentId };
}

export async function listLeads(actor: Actor) {
  return prisma.lead.findMany({
    where: leadScopeWhere(actor),
    include: {
      client: true,
      property: { select: { id: true, title: true, slug: true, reference: true } },
      assignedAgent: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLead(id: string, actor: Actor) {
  const lead = await prisma.lead.findFirst({
    where: { id, ...leadScopeWhere(actor) },
    include: {
      client: true,
      property: { select: { id: true, title: true, slug: true, reference: true } },
      assignedAgent: { select: { id: true, name: true, slug: true } },
      notes: { include: { author: { select: { email: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!lead) throw new AdminError('Lead not found.');
  return lead;
}

export async function createLead(input: unknown, actor: Actor) {
  const parsed = createLeadSchema.parse(input);
  const assignedAgentId = actor.role === 'ADMIN' ? parsed.assignedAgentId || null : actor.agentId;

  const lead = await prisma.lead.create({
    data: {
      clientId: parsed.clientId,
      propertyId: parsed.propertyId || null,
      assignedAgentId,
      source: parsed.source,
      message: parsed.message || null,
    },
  });
  await logActivity({ entityType: 'LEAD', entityId: lead.id, action: 'CREATED', actorUserId: actor.id });

  if (assignedAgentId) {
    const [agent, client] = await Promise.all([
      prisma.agent.findUnique({ where: { id: assignedAgentId }, select: { email: true, name: true } }),
      prisma.client.findUnique({ where: { id: lead.clientId }, select: { firstName: true, lastName: true } }),
    ]);
    if (agent && client) await notifyAgentNewLead(agent, client, lead.source, lead.message);
  }

  return lead;
}

const CLOSED_STAGES = new Set(['CLOSED_WON', 'CLOSED_LOST']);

export async function updateLeadStage(id: string, stage: unknown, actor: Actor) {
  const existing = await prisma.lead.findFirst({ where: { id, ...leadScopeWhere(actor) } });
  if (!existing) throw new AdminError('Lead not found or you do not have permission to edit it.');

  const nextStage = leadStageSchema.parse(stage);
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      stage: nextStage,
      closedAt: CLOSED_STAGES.has(nextStage) ? new Date() : null,
    },
  });

  if (lead.assignedAgentId && existing.stage !== 'CLOSED_WON' && nextStage === 'CLOSED_WON') {
    await prisma.agent.update({ where: { id: lead.assignedAgentId }, data: { dealsClosed: { increment: 1 } } });
  } else if (lead.assignedAgentId && existing.stage === 'CLOSED_WON' && nextStage !== 'CLOSED_WON') {
    await prisma.agent.update({ where: { id: lead.assignedAgentId }, data: { dealsClosed: { decrement: 1 } } });
  }

  await logActivity({
    entityType: 'LEAD',
    entityId: lead.id,
    action: 'STAGE_CHANGED',
    actorUserId: actor.id,
    metadata: { from: existing.stage, to: nextStage },
  });

  if (lead.assignedAgentId) {
    const [agent, client] = await Promise.all([
      prisma.agent.findUnique({ where: { id: lead.assignedAgentId }, select: { email: true, name: true } }),
      prisma.client.findUnique({ where: { id: lead.clientId }, select: { firstName: true, lastName: true } }),
    ]);
    if (agent && client) await notifyAgentLeadStageChanged(agent, client, existing.stage, nextStage);
  }

  return lead;
}

export async function assignLead(id: string, agentId: string, actor: Actor) {
  if (actor.role !== 'ADMIN') throw new AdminError('Only an admin can reassign leads.');
  const existing = await prisma.lead.findFirst({ where: { id } });
  if (!existing) throw new AdminError('Lead not found.');

  const lead = await prisma.lead.update({ where: { id }, data: { assignedAgentId: agentId } });
  await logActivity({
    entityType: 'LEAD',
    entityId: lead.id,
    action: 'ASSIGNED',
    actorUserId: actor.id,
    metadata: { from: existing.assignedAgentId, to: agentId },
  });

  const [agent, client] = await Promise.all([
    prisma.agent.findUnique({ where: { id: agentId }, select: { email: true, name: true } }),
    prisma.client.findUnique({ where: { id: lead.clientId }, select: { firstName: true, lastName: true } }),
  ]);
  if (agent && client) await notifyAgentLeadAssigned(agent, client);

  return lead;
}

export async function addLeadNote(id: string, body: unknown, actor: Actor) {
  const existing = await prisma.lead.findFirst({ where: { id, ...leadScopeWhere(actor) } });
  if (!existing) throw new AdminError('Lead not found or you do not have permission to comment on it.');

  const parsed = leadNoteSchema.parse({ body });
  const note = await prisma.leadNote.create({
    data: { leadId: id, authorUserId: actor.id, body: parsed.body },
  });
  await logActivity({ entityType: 'LEAD', entityId: id, action: 'NOTE_ADDED', actorUserId: actor.id });
  return note;
}

/** Caller must have already resolved the lead via getLead (which enforces scope) — no separate check needed here. */
export async function getLeadActivity(leadId: string) {
  return prisma.activityLog.findMany({
    where: { entityType: 'LEAD', entityId: leadId },
    include: { actor: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
