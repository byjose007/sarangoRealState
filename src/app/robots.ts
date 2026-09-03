import type { MetadataRoute } from 'next';
import { siteConfig } from '@/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // /blog is unlinked template content (see sitemap.ts) — keep crawlers out
    // of it too, in case something still points there.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/blog'] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
