import { prisma } from '@/lib/prisma';
import type { Actor } from './scope';

export async function getDashboardStats(actor: Actor) {
  const isAdmin = actor.role === 'ADMIN';
  const propertyWhere = isAdmin ? { deletedAt: null } : { deletedAt: null, agentId: actor.agentId ?? '__none__' };
  const leadWhere = isAdmin ? {} : { assignedAgentId: actor.agentId ?? '__none__' };
  const clientWhere = isAdmin ? {} : { leads: { some: { assignedAgentId: actor.agentId ?? '__none__' } } };

  const [propertyCount, clientCount, leadsByStage, recentActivity] = await Promise.all([
    prisma.property.count({ where: propertyWhere }),
    prisma.client.count({ where: clientWhere }),
    prisma.lead.groupBy({ by: ['stage'], where: leadWhere, _count: { _all: true } }),
    isAdmin
      ? prisma.activityLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { actor: { select: { email: true } } },
        })
      : Promise.resolve([]),
  ]);

  const stageCounts = Object.fromEntries(leadsByStage.map((row) => [row.stage, row._count._all]));
  const openLeadCount = leadsByStage
    .filter((row) => row.stage !== 'CLOSED_WON' && row.stage !== 'CLOSED_LOST')
    .reduce((sum, row) => sum + row._count._all, 0);

  return { propertyCount, clientCount, stageCounts, openLeadCount, recentActivity };
}
