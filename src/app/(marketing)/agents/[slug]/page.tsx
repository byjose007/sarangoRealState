import { notFound } from 'next/navigation';
import { agentBySlug, agents } from '@/data/agents';
import { cities } from '@/data/reference';
import { getPropertiesByAgent } from '@/services/property-service';
import { buildMetadata } from '@/lib/seo';
import { AgentDetailView } from '@/components/agent/agent-detail-view';

export async function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = agentBySlug(slug);
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
  const agent = agentBySlug(slug);
  if (!agent) notFound();

  const listings = getPropertiesByAgent(agent.id);
  const city = cities.find((item) => item.slug === agent.citySlug);

  return <AgentDetailView agent={agent} city={city} listings={listings} />;
}
