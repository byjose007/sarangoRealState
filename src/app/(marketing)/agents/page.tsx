import { listAgents } from '@/services/agent-service';
import { cities } from '@/data/reference';
import { buildMetadata } from '@/lib/seo';
import { AgentsView } from '@/components/agent/agents-view';

export const metadata = buildMetadata({
  title: 'Our agents',
  description: 'Agentes de Sarango Real Estate en Cuenca. Encuentra el asesor perfecto para tu propiedad.',
  path: '/agents',
});

// Not ISR — see src/app/(marketing)/page.tsx for why (no dynamic params to
// gate a build-time-empty static shell, so render fresh every request).
export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const agents = await listAgents();
  return <AgentsView agents={agents} cities={cities} />;
}
