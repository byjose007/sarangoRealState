import { notFound } from 'next/navigation';
import { getAllPropertySlugs, getPropertyBySlug, getSimilar } from '@/services/property-service';
import { getAgentById } from '@/services/agent-service';
import { cities } from '@/data/reference';
import { buildMetadata, residenceJsonLd } from '@/lib/seo';
import { siteConfig } from '@/constants/site';
import { PropertyDetailView } from '@/components/property/property-detail-view';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
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
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [agent, similar] = await Promise.all([getAgentById(property.agentId), getSimilar(property, 3)]);
  const city = cities.find((item) => item.slug === property.citySlug);

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
      <PropertyDetailView property={property} agent={agent ?? undefined} city={city} similar={similar} />
    </>
  );
}
