import { Hero } from '@/components/home/hero';
import { Pillars } from '@/components/home/pillars';
import { FeaturedProperties } from '@/components/home/featured-properties';
import { PropertyTypes } from '@/components/home/property-types';
import { Stats } from '@/components/home/stats';
import { VideoFeature } from '@/components/home/video-feature';
import { CitiesGrid } from '@/components/home/cities-grid';
import { AgentsPreview } from '@/components/home/agents-preview';
import { Testimonials } from '@/components/home/testimonials';
import { JournalPreview } from '@/components/home/journal-preview';
import { Partners } from '@/components/home/partners';
import { CallToAction } from '@/components/home/cta';
import { RecentlyViewed } from '@/components/property/recently-viewed';
import { getFacets, getFeaturedProperties } from '@/services/property-service';
import { listAgents } from '@/services/agent-service';

// Not ISR: this route has no dynamic params, so a Docker build (no DB
// reachable at build time) would otherwise bake in an empty homepage and
// serve it stale for the first `revalidate` window after every deploy. It's
// a cheap query — render it fresh on every request instead.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, facets, agents] = await Promise.all([getFeaturedProperties(9), getFacets(), listAgents()]);

  return (
    <>
      <Hero />
      <Pillars />
      <FeaturedProperties properties={featured} />
      <PropertyTypes byType={facets.byType} />
      <Stats />
      <VideoFeature />
      <CitiesGrid byCity={facets.byCity} />
      <AgentsPreview agents={agents.slice(0, 4)} />
      <Testimonials />
      <JournalPreview />
      <Partners />
      <CallToAction />
      <RecentlyViewed />
    </>
  );
}
