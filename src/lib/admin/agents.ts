import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logActivity } from './activity';
import { AdminError } from './errors';
import type { Actor } from './scope';
import { createAgentSchema, updateAgentSchema } from '@/lib/validation-admin';

export async function listAgents(actor: Actor) {
  if (actor.role !== 'ADMIN') throw new AdminError('Only an admin can list all agents.');
  return prisma.agent.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
}

export async function getAgent(id: string, actor: Actor) {
  if (actor.role !== 'ADMIN' && actor.agentId !== id) {
    throw new AdminError('You do not have permission to view this agent.');
  }
  const agent = await prisma.agent.findFirst({ where: { id, deletedAt: null } });
  if (!agent) throw new AdminError('Agent not found.');
  return agent;
}

export async function createAgent(input: unknown, actor: Actor) {
  if (actor.role !== 'ADMIN') throw new AdminError('Only an admin can create agents.');
  const parsed = createAgentSchema.parse(input);
  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const agent = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: parsed.loginEmail, passwordHash, role: 'AGENT' },
    });
    return tx.agent.create({
      data: {
        slug: parsed.slug,
        name: parsed.name,
        role: parsed.role,
        license: parsed.license || null,
        avatar: parsed.avatar,
        phone: parsed.phone,
        email: parsed.email,
        address: parsed.address || null,
        citySlug: parsed.citySlug,
        bio: parsed.bio,
        languages: parsed.languages,
        specialties: parsed.specialties,
        experienceYears: parsed.experienceYears,
        dealsClosed: parsed.dealsClosed,
        rating: parsed.rating,
        social: parsed.social,
        userId: user.id,
      },
    });
  });

  await logActivity({ entityType: 'AGENT', entityId: agent.id, action: 'CREATED', actorUserId: actor.id });
  return agent;
}

export async function updateAgent(id: string, input: unknown, actor: Actor) {
  if (actor.role !== 'ADMIN' && actor.agentId !== id) {
    throw new AdminError('You do not have permission to edit this agent.');
  }
  const existing = await prisma.agent.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AdminError('Agent not found.');

  const parsed = updateAgentSchema.parse(input);
  const agent = await prisma.agent.update({ where: { id }, data: parsed });
  await logActivity({
    entityType: 'AGENT',
    entityId: agent.id,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: parsed,
  });
  return agent;
}

export async function softDeleteAgent(id: string, actor: Actor) {
  if (actor.role !== 'ADMIN') throw new AdminError('Only an admin can delete agents.');
  const existing = await prisma.agent.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AdminError('Agent not found.');

  const agent = await prisma.agent.update({ where: { id }, data: { deletedAt: new Date() } });
  if (agent.userId) {
    await prisma.user.update({ where: { id: agent.userId }, data: { isActive: false } });
  }
  await logActivity({ entityType: 'AGENT', entityId: agent.id, action: 'DELETED', actorUserId: actor.id });
  return agent;
}
