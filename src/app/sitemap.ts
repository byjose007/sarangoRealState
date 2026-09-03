import type { MetadataRoute } from 'next';
import { siteConfig } from '@/constants/site';
import { getPropertiesForSitemap } from '@/services/property-service';
import { getAgentsForSitemap } from '@/services/agent-service';

// Not ISR: this route has no dynamic params, so a Docker build (no DB
// reachable at build time) would otherwise bake in an empty sitemap and
// serve it stale for the first `revalidate` window after every deploy. It's
// a cheap query — render it fresh on every request instead.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  // '/blog' is intentionally excluded — it's still template journal content
  // (see AGENTS.md / conversation), not published for the real business yet.
  const staticRoutes = [
    '',
    '/properties',
    '/agents',
    '/about',
    '/contact',
    '/compare',
    '/favorites',
  ];

  const [properties, agents] = await Promise.all([
    getPropertiesForSitemap(),
    getAgentsForSitemap(),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...properties.map((property) => ({
      url: `${base}/properties/${property.slug}`,
      lastModified: property.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...agents.map((agent) => ({
      url: `${base}/agents/${agent.slug}`,
      lastModified: agent.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
