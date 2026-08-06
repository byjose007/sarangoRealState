import type { Agent } from '@/types';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { safeBuildTimeFetch } from '@/lib/safe-build-fetch';

/**
 * Prisma-backed agent directory — powers /agents, /about, property listings
 * and anything CRM-relevant. Blog post authorship deliberately stays on the
 * static `data/agents.ts` mock (see that file's comment): article authorId
 * values are fixture ids that don't correspond to real Agent rows, and blog
 * content isn't managed from the admin panel, so unifying the two would
 * silently break "By {author}" bylines rather than simplify anything.
 */

type AgentRow = Prisma.AgentGetPayload<Record<string, never>>;

function mapAgent(row: AgentRow): Agent {
  const social = (row.social ?? {}) as { tiktok?: string; instagram?: string; facebook?: string };
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    license: row.license ?? undefined,
    avatar: row.avatar,
    phone: row.phone,
    email: row.email,
    address: row.address ?? undefined,
    citySlug: row.citySlug,
    bio: row.bio,
    languages: row.languages,
    specialties: row.specialties,
    experienceYears: row.experienceYears,
    dealsClosed: row.dealsClosed,
    rating: row.rating,
    social,
  };
}

const ACTIVE = { deletedAt: null } as const;

/** Called from the (statically-generated) home, /agents and /about pages — see safeBuildTimeFetch. */
export async function listAgents(): Promise<Agent[]> {
  return safeBuildTimeFetch(
    async () => {
      const rows = await prisma.agent.findMany({ where: ACTIVE, orderBy: { name: 'asc' } });
      return rows.map(mapAgent);
    },
    [],
    'listAgents',
  );
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const row = await prisma.agent.findFirst({ where: { slug, ...ACTIVE } });
  return row ? mapAgent(row) : null;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const row = await prisma.agent.findFirst({ where: { id, ...ACTIVE } });
  return row ? mapAgent(row) : null;
}

/** Preserves the order of `ids`. */
export async function getAgentsByIds(ids: string[]): Promise<Agent[]> {
  if (!ids.length) return [];
  const rows = await prisma.agent.findMany({ where: { id: { in: ids }, ...ACTIVE } });
  const byId = new Map(rows.map(mapAgent).map((agent) => [agent.id, agent]));
  return ids.map((id) => byId.get(id)).filter((agent): agent is Agent => Boolean(agent));
}

/**
 * Only called from generateStaticParams at build time — with no matching
 * static param, Next falls back to on-demand rendering + ISR per-page, so
 * an empty result here just means zero pages are pre-rendered at build time
 * rather than a build failure. See safeBuildTimeFetch.
 */
export async function getAllAgentSlugs(): Promise<string[]> {
  return safeBuildTimeFetch(
    async () => {
      const rows = await prisma.agent.findMany({ where: ACTIVE, select: { slug: true } });
      return rows.map((row) => row.slug);
    },
    [],
    'getAllAgentSlugs',
  );
}

/** Called from the (statically-generated) sitemap.xml route — see safeBuildTimeFetch. */
export async function getAgentsForSitemap() {
  return safeBuildTimeFetch(
    () => prisma.agent.findMany({ where: ACTIVE, select: { slug: true, updatedAt: true } }),
    [],
    'getAgentsForSitemap',
  );
}
