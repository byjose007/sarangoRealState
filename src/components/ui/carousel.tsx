'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  slideClassName?: string;
  autoplay?: boolean;
  align?: 'start' | 'center';
  loop?: boolean;
  controls?: boolean;
  /** Rendered next to the arrows, e.g. a "view all" link. */
  aside?: React.ReactNode;
}

/**
 * One carousel engine for the whole template (Embla).
 * Slides are plain children — the parent decides widths via `slideClassName`.
 */
export function Carousel({
  children,
  className,
  slideClassName = 'min-w-0 shrink-0 grow-0 basis-[86%] sm:basis-1/2 lg:basis-1/3',
  autoplay = false,
  align = 'start',
  loop = true,
  controls = true,
  aside,
}: CarouselProps) {
  const [ref, api] = useEmblaCarousel(
    { align, loop, containScroll: 'trimSnaps' },
    autoplay ? [Autoplay({ delay: 5200, stopOnInteraction: true })] : [],
  );
  const [snap, setSnap] = React.useState(0);
  const [snaps, setSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setSnap(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList());
    };
    update();
    api.on('select', update).on('reInit', update);
  }, [api]);

  return (
    <div className={className}>
      <div ref={ref} className="overflow-hidden">
        <div className="flex gap-5">
          {React.Children.map(children, (child, index) => (
            <div key={index} className={slideClassName}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {controls ? (
        <div className="mt-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            {snaps.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  index === snap ? 'w-8 bg-brass' : 'w-3 bg-border hover:bg-muted-foreground/50',
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {aside}
            <button
              type="button"
              aria-label="Previous"
              onClick={() => api?.scrollPrev()}
              className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => api?.scrollNext()}
              className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
