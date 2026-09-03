import { Wrench } from 'lucide-react';
import { siteConfig } from '@/constants/site';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Scheduled maintenance',
  description: 'The Sarango Real Estate catalogue is briefly offline for scheduled maintenance.',
  path: '/maintenance',
});

export default function MaintenancePage() {
  return (
    <section className="container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full border border-border text-brass">
        <Wrench className="size-6" />
      </span>
      <span className="eyebrow mt-8">Back within the hour</span>
      <h1 className="balance mt-5 max-w-2xl text-headline">
        We are re-indexing the survey archive
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Listing pages are briefly unavailable while the document packs re-sync. Viewings already
        booked are unaffected.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-6 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
        <a href={`tel:${siteConfig.phone}`} className="hover:text-foreground">
          {siteConfig.phone}
        </a>
        <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
          {siteConfig.email}
        </a>
      </div>
    </section>
  );
}
