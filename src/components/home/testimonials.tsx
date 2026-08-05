'use client';

import { Quote } from 'lucide-react';
import { getTestimonials } from '@/data/reference';
import { useTranslation } from '@/i18n/context';
import { Carousel } from '@/components/ui/carousel';
import { SectionHeading } from '@/components/shared/section-heading';
import { SmartImage } from '@/components/shared/smart-image';
import { Rating } from '@/components/shared/rating';

export function Testimonials() {
  const { t, isEs } = useTranslation();
  const list = getTestimonials(isEs);

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={t.home.closedAndSigned}
          title={t.home.closedAndSignedTitle}
        />

        <Carousel
          className="mt-12"
          slideClassName="min-w-0 shrink-0 grow-0 basis-[88%] sm:basis-1/2 lg:basis-1/3"
        >
          {list.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex h-full flex-col rounded-lg border border-border bg-card p-7"
            >
              <Quote className="size-6 text-brass" />
              <blockquote className="mt-5 flex-1 text-[0.95rem] leading-relaxed">
                {testimonial.quote}
              </blockquote>
              <Rating value={testimonial.rating} className="mt-6" />
              <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
                  <SmartImage
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    sizes="44px"
                    fallbackSeed={testimonial.id}
                  />
                </div>
                <div>
                  <p className="font-display text-base">{testimonial.name}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {testimonial.location} · {testimonial.dealType}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
