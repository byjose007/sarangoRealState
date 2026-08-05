import { notFound } from 'next/navigation';
import { properties, propertyBySlug } from '@/data/properties';
import { agentById } from '@/data/agents';
import { cities } from '@/data/reference';
import { getSimilar } from '@/services/property-service';
import { buildMetadata, residenceJsonLd } from '@/lib/seo';
import { siteConfig } from '@/constants/site';
import { PropertyDetailView } from '@/components/property/property-detail-view';

export async function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = propertyBySlug(slug);
  if (!property) return buildMetadata({ title: 'Listing not found', path: '/properties' });

  return buildMetadata({
    title: `${property.title} — ${property.address}`,
    description: property.description.split('\n\n')[0],
    path: `/properties/${property.slug}`,
    image: property.images[0],
  });
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = propertyBySlug(slug);
  if (!property) notFound();

  const agent = agentById(property.agentId);
  const city = cities.find((item) => item.slug === property.citySlug);
  const similar = getSimilar(property, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            residenceJsonLd({
              name: property.title,
              description: property.description.split('\n\n')[0] ?? '',
              image: property.images,
              price: property.price,
              address: property.address,
              area: property.area,
              rooms: property.bedrooms,
              url: `${siteConfig.url}/properties/${property.slug}`,
            }),
          ),
        }}
      />
      <PropertyDetailView property={property} agent={agent} city={city} similar={similar} />
    </>
  );
}
