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

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pillars />
      <FeaturedProperties />
      <PropertyTypes />
      <Stats />
      <VideoFeature />
      <CitiesGrid />
      <AgentsPreview />
      <Testimonials />
      <JournalPreview />
      <Partners />
      <CallToAction />
      <RecentlyViewed />
    </>
  );
}
