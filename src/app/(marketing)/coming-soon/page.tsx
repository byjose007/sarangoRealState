import { buildMetadata } from '@/lib/seo';
import { unsplash } from '@/data/images';
import { SmartImage } from '@/components/shared/smart-image';
import { Newsletter } from '@/components/layout/newsletter';

export const metadata = buildMetadata({
  title: 'Coming soon',
  description: 'Two more Sarango Real Estate desks open this year. Ask to be told first.',
  path: '/coming-soon',
});

export default function ComingSoonPage() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <SmartImage
        src={unsplash(28, 1600, 1000)}
        alt=""
        fill
        priority
        sizes="100vw"
        fallbackSeed="coming-soon"
      />
      <div className="absolute inset-0 bg-foreground/75" />
      <div className="container relative flex min-h-[80vh] flex-col items-center justify-center py-20 text-center text-background">
        <span className="eyebrow text-background/70 before:bg-brass">Opening 2026</span>
        <h1 className="balance mt-6 max-w-3xl text-display">Two more desks. Same tape measure.</h1>
        <p className="mt-6 max-w-lg text-background/75">
          Chicago and Vancouver open next. Leave an email and we will send the first surveyed
          listings before they reach the public catalogue.
        </p>
        <div className="mt-9 w-full max-w-md [&_input]:border-background/25 [&_input]:bg-background/10 [&_input]:text-background [&_input]:placeholder:text-background/50">
          <Newsletter />
        </div>
      </div>
    </section>
  );
}
