import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { ActivityAction, ActivityEntity } from '@/generated/prisma/enums';

export async function logActivity(params: {
  entityType: ActivityEntity;
  entityId: string;
  action: ActivityAction;
  actorUserId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.activityLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorUserId: params.actorUserId ?? null,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
