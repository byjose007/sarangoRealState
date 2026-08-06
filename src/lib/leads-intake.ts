import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/admin/activity';
import { notifyAgentNewLead } from '@/lib/lead-notifications';
import type { AgentMessageInput, ContactInput, ViewingInput } from '@/lib/validation';

interface IntakeContact {
  name: string;
  email: string;
  phone?: string;
}

interface ClientLike {
  firstName: string;
  lastName: string;
}

async function notifyIfAssigned(agentId: string | null | undefined, client: ClientLike, source: string, message?: string | null) {
  if (!agentId) return;
  const agent = await prisma.agent.findUnique({ where: { id: agentId }, select: { email: true, name: true } });
  if (agent) await notifyAgentNewLead(agent, client, source, message);
}

/**
 * Public forms have no session — leads are created without an actor
 * (actorUserId: null in the activity log marks these as system/visitor
 * triggered, distinct from staff-driven mutations).
 */
async function findOrCreateClient(contact: IntakeContact) {
  const [firstName, ...rest] = contact.name.trim().split(/\s+/);
  return prisma.client.upsert({
    where: { email: contact.email },
    update: { phone: contact.phone || undefined },
    create: {
      firstName: firstName || contact.name,
      lastName: rest.join(' '),
      email: contact.email,
      phone: contact.phone || null,
    },
  });
}

export async function createLeadFromViewing(input: ViewingInput) {
  const client = await findOrCreateClient(input);
  const property = input.propertyReference
    ? await prisma.property.findUnique({ where: { reference: input.propertyReference } })
    : null;

  const lead = await prisma.lead.create({
    data: {
      clientId: client.id,
      propertyId: property?.id,
      assignedAgentId: property?.agentId,
      source: 'WEBSITE_VIEWING',
      message: `Viewing requested for ${input.date} at ${input.time}.${input.message ? `\n\n${input.message}` : ''}`,
    },
  });
  await logActivity({ entityType: 'LEAD', entityId: lead.id, action: 'CREATED', metadata: { source: 'viewing' } });
  await notifyIfAssigned(lead.assignedAgentId, client, 'Viewing request', lead.message);
  return lead;
}

export async function createLeadFromContact(input: ContactInput) {
  const client = await findOrCreateClient(input);
  const lead = await prisma.lead.create({
    data: {
      clientId: client.id,
      source: 'WEBSITE_CONTACT',
      message: `[${input.topic}] ${input.message}`,
    },
  });
  await logActivity({ entityType: 'LEAD', entityId: lead.id, action: 'CREATED', metadata: { source: 'contact' } });
  return lead;
}

export async function createLeadFromAgentMessage(input: AgentMessageInput, agentId: string) {
  const client = await findOrCreateClient(input);
  const lead = await prisma.lead.create({
    data: {
      clientId: client.id,
      assignedAgentId: agentId,
      source: 'WEBSITE_AGENT_MESSAGE',
      message: input.message,
    },
  });
  await logActivity({ entityType: 'LEAD', entityId: lead.id, action: 'CREATED', metadata: { source: 'agent-message' } });
  await notifyIfAssigned(lead.assignedAgentId, client, 'Message to agent', lead.message);
  return lead;
}
