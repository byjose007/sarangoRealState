import { listAgents } from '@/services/agent-service';
import { buildMetadata } from '@/lib/seo';
import { AboutView } from '@/components/about/about-view';

export const metadata = buildMetadata({
  title: 'About',
  description: 'Vestra has measured 4,200 homes since 2009. Here is how the survey-first model works.',
  path: '/about',
});

// Not ISR — see src/app/(marketing)/page.tsx for why (no dynamic params to
// gate a build-time-empty static shell, so render fresh every request).
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const agents = await listAgents();
  return <AboutView agents={agents} />;
}
