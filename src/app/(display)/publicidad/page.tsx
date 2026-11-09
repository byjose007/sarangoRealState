import type { Metadata } from 'next';
import { getSlideshowProperties } from '@/services/property-service';
import { cities } from '@/data/reference';
import { siteConfig } from '@/constants/site';
import {
  PropertySlideshow,
  type SlideshowFormat,
  type SlideshowProperty,
  type SlideshowWeather,
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
  searchParams: Promise<{
    intervalo?: string;
    destacadas?: string;
    marca?: string;
    promos?: string;
    formato?: string;
  }>;
}

async function fetchInitialWeather(lat: number, lng: number): Promise<SlideshowWeather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day&timezone=America%2FGuayaquil`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
    };
    if (typeof data.current?.temperature_2m !== 'number') return null;
    return {
      tempC: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code ?? 1,
      isDay: (data.current.is_day ?? 1) === 1,
    };
  } catch {
    return null;
  }
}

export default async function PublicidadPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const office = siteConfig.offices[0];
  const coords = office?.coordinates ?? { lat: -2.9001, lng: -79.0059 };

  const [properties, initialWeather] = await Promise.all([
    getSlideshowProperties(),
    fetchInitialWeather(coords.lat, coords.lng),
  ]);

  const featuredOnly = params.destacadas === '1';
  const showBrandSlide = params.marca !== '0';
  const showPromoSlides = params.promos !== '0';
  const initialFormat: SlideshowFormat =
    params.formato === 'totem' || params.formato === 'vertical'
      ? 'portrait'
      : params.formato === 'tv' || params.formato === 'horizontal'
        ? 'landscape'
        : 'auto';

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
      utilitiesIncluded: property.utilitiesIncluded,
      petsAllowed: property.petsAllowed,
      hoaFee: property.hoaFee,
      images: property.images.slice(0, MAX_IMAGES_PER_SLIDE),
    }));

  const siteHost = siteConfig.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <PropertySlideshow
      properties={slides}
      intervalMs={intervalSeconds * 1000}
      showBrandSlide={showBrandSlide}
      showPromoSlides={showPromoSlides}
      initialFormat={initialFormat}
      initialWeather={initialWeather}
      contact={{
        name: siteConfig.name,
        tagline: siteConfig.tagline,
        phone: siteConfig.phone,
        whatsapp: siteConfig.whatsapp,
        site: siteHost,
        url: siteConfig.url.replace(/\/$/, ''),
        hours: siteConfig.hours,
        officeCity: office?.city ?? 'Cuenca',
        officeAddress: office?.address ?? 'Cuenca, Ecuador',
        coordinates: coords,
      }}
    />
  );
}
