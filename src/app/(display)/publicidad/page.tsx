import type { Metadata } from 'next';
import { getSlideshowProperties } from '@/services/property-service';
import { cities } from '@/data/reference';
import { siteConfig } from '@/constants/site';
import {
  PropertySlideshow,
  type SlideshowProperty,
} from '@/components/slideshow/property-slideshow';

export const metadata: Metadata = {
  title: 'Publicidad',
  description: 'Presentación automática de propiedades para pantallas y televisores.',
  // Signage screen, not a landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

// Same reasoning as the marketing pages: render fresh on every request so a
// screen that reloads (or calls router.refresh()) picks up new listings.
export const dynamic = 'force-dynamic';

const MAX_IMAGES_PER_SLIDE = 4;
const DEFAULT_INTERVAL_SECONDS = 12;

interface PageProps {
  searchParams: Promise<{ intervalo?: string; destacadas?: string }>;
}

export default async function PublicidadPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const properties = await getSlideshowProperties();

  const featuredOnly = params.destacadas === '1';
  const parsedInterval = Number(params.intervalo);
  const intervalSeconds =
    Number.isFinite(parsedInterval) && parsedInterval >= 5 && parsedInterval <= 120
      ? parsedInterval
      : DEFAULT_INTERVAL_SECONDS;

  const cityNames = new Map(cities.map((city) => [city.slug, city.name]));

  // Only ship what the screen renders — the full Property shape carries
  // floor plans, documents, etc. that would just bloat the payload.
  const slides: SlideshowProperty[] = properties
    .filter((property) => property.images.length > 0)
    .filter((property) => !featuredOnly || property.featured)
    .map((property) => ({
      id: property.id,
      slug: property.slug,
      reference: property.reference,
      title: property.title,
      status: property.status,
      type: property.type,
      price: property.price,
      pricePeriod: property.pricePeriod,
      address: property.address,
      city: cityNames.get(property.citySlug) ?? property.citySlug,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      garages: property.garages,
      area: property.area,
      landArea: property.landArea,
      featured: property.featured,
      images: property.images.slice(0, MAX_IMAGES_PER_SLIDE),
    }));

  const siteHost = siteConfig.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <PropertySlideshow
      properties={slides}
      intervalMs={intervalSeconds * 1000}
      contact={{
        name: siteConfig.name,
        phone: siteConfig.phone,
        site: siteHost,
      }}
    />
  );
}
