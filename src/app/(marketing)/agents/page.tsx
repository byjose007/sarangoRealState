import { agents } from '@/data/agents';
import { cities } from '@/data/reference';
import { buildMetadata } from '@/lib/seo';
import { AgentsView } from '@/components/agent/agents-view';

export const metadata = buildMetadata({
  title: 'Our agents',
  description: 'Agentes de Sarango Real Estate en Cuenca. Encuentra el asesor perfecto para tu propiedad.',
  path: '/agents',
});

export default function AgentsPage() {
  return <AgentsView agents={agents} cities={cities} />;
}
