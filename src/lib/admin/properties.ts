import { prisma } from '@/lib/prisma';
import { logActivity } from './activity';
import { AdminError } from './errors';
import { agentScopeWhere, type Actor } from './scope';
import { createPropertySchema, updatePropertySchema } from '@/lib/validation-admin';

export async function listProperties(actor: Actor) {
  return prisma.property.findMany({
    where: { deletedAt: null, ...agentScopeWhere(actor) },
    include: { agent: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProperty(id: string, actor: Actor) {
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null, ...agentScopeWhere(actor) },
    include: { agent: true, images: true, floorPlans: true, documents: true },
  });
  if (!property) throw new AdminError('Property not found.');
  return property;
}

export async function createProperty(input: unknown, actor: Actor) {
  const parsed = createPropertySchema.parse(input);
  const { agentId: requestedAgentId, images, ...scalarData } = parsed;

  if (actor.role !== 'ADMIN' && requestedAgentId && requestedAgentId !== actor.agentId) {
    throw new AdminError('You cannot create properties for another agent.');
  }
  const agentId = actor.role === 'ADMIN' ? requestedAgentId : actor.agentId;
  if (!agentId) throw new AdminError('This property needs a responsible agent.');

  const property = await prisma.property.create({
    data: {
      ...scalarData,
      agentId,
      images:
        images && images.length > 0
          ? {
              create: images.map((url, position) => ({ url, position })),
            }
          : undefined,
    },
  });
  await logActivity({
    entityType: 'PROPERTY',
    entityId: property.id,
    action: 'CREATED',
    actorUserId: actor.id,
  });
  return property;
}

export async function updateProperty(id: string, input: unknown, actor: Actor) {
  const existing = await prisma.property.findFirst({
    where: { id, deletedAt: null, ...agentScopeWhere(actor) },
  });
  if (!existing)
    throw new AdminError('Property not found or you do not have permission to edit it.');

  const parsed = updatePropertySchema.parse(input);
  const { images, ...scalarData } = parsed;

  const property = await prisma.property.update({ where: { id }, data: scalarData });

  if (images !== undefined) {
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    if (images.length > 0) {
      await prisma.propertyImage.createMany({
        data: images.map((url, position) => ({ propertyId: id, url, position })),
      });
    }
  }

  await logActivity({
    entityType: 'PROPERTY',
    entityId: property.id,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: parsed,
  });
  return property;
}

export async function softDeleteProperty(id: string, actor: Actor) {
  const existing = await prisma.property.findFirst({
    where: { id, deletedAt: null, ...agentScopeWhere(actor) },
  });
  if (!existing)
    throw new AdminError('Property not found or you do not have permission to delete it.');

  const property = await prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({
    entityType: 'PROPERTY',
    entityId: property.id,
    action: 'DELETED',
    actorUserId: actor.id,
  });
  return property;
}

export async function assertEditableProperty(propertyId: string, actor: Actor) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null, ...agentScopeWhere(actor) },
  });
  if (!property)
    throw new AdminError('Property not found or you do not have permission to edit it.');
  return property;
}

export async function addPropertyImage(propertyId: string, url: string, actor: Actor) {
  await assertEditableProperty(propertyId, actor);

  const highest = await prisma.propertyImage.aggregate({
    where: { propertyId },
    _max: { position: true },
  });
  const image = await prisma.propertyImage.create({
    data: { propertyId, url, position: (highest._max.position ?? -1) + 1 },
  });
  await logActivity({
    entityType: 'PROPERTY',
    entityId: propertyId,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: { imageAdded: image.id },
  });
  return image;
}

export async function removePropertyImage(imageId: string, actor: Actor) {
  const image = await prisma.propertyImage.findUnique({ where: { id: imageId } });
  if (!image) throw new AdminError('Image not found.');
  await assertEditableProperty(image.propertyId, actor);

  await prisma.propertyImage.delete({ where: { id: imageId } });
  await logActivity({
    entityType: 'PROPERTY',
    entityId: image.propertyId,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: { imageRemoved: imageId },
  });
  return image;
}

export async function addPropertyDocument(
  propertyId: string,
  doc: { name: string; type: 'PDF' | 'DWG' | 'ZIP'; size: string; href: string },
  actor: Actor,
) {
  await assertEditableProperty(propertyId, actor);

  const document = await prisma.propertyDocument.create({ data: { propertyId, ...doc } });
  await logActivity({
    entityType: 'PROPERTY',
    entityId: propertyId,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: { documentAdded: document.id },
  });
  return document;
}

export async function removePropertyDocument(documentId: string, actor: Actor) {
  const document = await prisma.propertyDocument.findUnique({ where: { id: documentId } });
  if (!document) throw new AdminError('Document not found.');
  await assertEditableProperty(document.propertyId, actor);

  await prisma.propertyDocument.delete({ where: { id: documentId } });
  await logActivity({
    entityType: 'PROPERTY',
    entityId: document.propertyId,
    action: 'UPDATED',
    actorUserId: actor.id,
    metadata: { documentRemoved: documentId },
  });
  return document;
}
