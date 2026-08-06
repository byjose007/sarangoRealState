import { notFound } from 'next/navigation';
import { getAgentBySlug, getAllAgentSlugs } from '@/services/agent-service';
import { cities } from '@/data/reference';
import { getPropertiesByAgent } from '@/services/property-service';
import { buildMetadata } from '@/lib/seo';
import { AgentDetailView } from '@/components/agent/agent-detail-view';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllAgentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return buildMetadata({ title: 'Agent not found', path: '/agents' });
  return buildMetadata({
    title: `${agent.name} — ${agent.role}`,
    description: agent.bio,
    path: `/agents/${agent.slug}`,
    image: agent.avatar,
  });
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const listings = await getPropertiesByAgent(agent.id);
  const city = cities.find((item) => item.slug === agent.citySlug);

  return <AgentDetailView agent={agent} city={city} listings={listings} />;
}
