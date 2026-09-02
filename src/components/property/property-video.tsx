'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { SmartImage } from '@/components/shared/smart-image';
import { useTranslation } from '@/i18n/context';

/** Poster first, iframe only after the click — keeps the page light. */
export function PropertyVideo({
  url,
  poster,
  title,
}: {
  url: string;
  poster: string;
  title: string;
}) {
  const { isEs } = useTranslation();
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-foreground">
      {playing ? (
        <iframe
          src={`${url}?autoplay=1`}
          title={`${title} — ${isEs ? 'video del recorrido' : 'video tour'}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative h-full w-full"
        >
          <SmartImage
            src={poster}
            alt={`${title} — ${isEs ? 'imagen de vista previa del video' : 'video poster'}`}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            fallbackSeed={title}
          />
          <span className="absolute inset-0 grid place-items-center bg-foreground/25 transition-colors group-hover:bg-foreground/35">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-background/90 transition-transform group-hover:scale-110">
              <Play className="size-6 translate-x-0.5 fill-foreground" />
            </span>
          </span>
          <span className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em]">
            {isEs ? 'Recorrido · 2 min' : 'Walkthrough · 2 min'}
          </span>
        </button>
      )}
    </div>
  );
}
