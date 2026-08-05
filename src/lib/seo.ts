import type { Metadata } from 'next';
import { siteConfig } from '@/constants/site';

interface SeoInput {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}

/** Single source of truth for page metadata, Open Graph and Twitter cards. */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
}: SeoInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      type,
      locale: siteConfig.locale,
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${siteConfig.name}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** schema.org helpers — injected as JSON-LD on the relevant pages. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: siteConfig.offices.map((office) => ({
      '@type': 'PostalAddress',
      streetAddress: office.address,
      addressLocality: office.city,
    })),
  };
}

export function residenceJsonLd(input: {
  name: string;
  description: string;
  image: string[];
  price: number;
  address: string;
  area: number;
  rooms: number;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    name: input.name,
    description: input.description,
    image: input.image,
    url: input.url,
    address: { '@type': 'PostalAddress', streetAddress: input.address },
    numberOfRooms: input.rooms,
    floorSize: { '@type': 'QuantitativeValue', value: input.area, unitCode: 'FTK' },
    offers: { '@type': 'Offer', price: input.price, priceCurrency: 'USD' },
  };
}
