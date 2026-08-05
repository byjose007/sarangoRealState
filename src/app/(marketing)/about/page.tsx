import { agents } from '@/data/agents';
import { buildMetadata } from '@/lib/seo';
import { AboutView } from '@/components/about/about-view';

export const metadata = buildMetadata({
  title: 'About',
  description: 'Vestra has measured 4,200 homes since 2009. Here is how the survey-first model works.',
  path: '/about',
});

export default function AboutPage() {
  return <AboutView agents={agents} />;
}
