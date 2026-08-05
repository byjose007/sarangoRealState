'use client';

import { unsplash } from '@/data/images';
import { useTranslation } from '@/i18n/context';
import { PropertyVideo } from '@/components/property/property-video';
import { Reveal } from '@/components/shared/reveal';

export function VideoFeature() {
  const { t } = useTranslation();

  return (
    <section className="container py-20 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <span className="eyebrow">{t.home.insideSurvey}</span>
          <h2 className="mt-4 text-headline balance">
            {t.home.surveySub}
          </h2>
          <p className="mt-5 text-muted-foreground">
            {t.home.surveyDesc}
          </p>
          <ul className="mt-8 space-y-3 border-t border-border pt-6 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
            {t.home.surveyItems.map((item, index) => (
              <li key={item} className="flex items-center gap-4">
                <span className="text-brass">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <PropertyVideo
            url="https://www.youtube.com/embed/ScMzIvxBSi4"
            poster={unsplash(17, 1200, 700)}
            title={t.home.videoTitle}
          />
        </Reveal>
      </div>
    </section>
  );
}
