import type { MetadataRoute } from 'next';
import { siteConfig } from '@/constants/site';
import { properties } from '@/data/properties';
import { agents } from '@/data/agents';
import { articles } from '@/data/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = ['', '/properties', '/agents', '/blog', '/about', '/contact', '/compare', '/favorites'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...properties.map((property) => ({
      url: `${base}/properties/${property.slug}`,
      lastModified: new Date(property.createdAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...agents.map((agent) => ({
      url: `${base}/agents/${agent.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...articles.map((article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
