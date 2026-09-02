'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, Images } from 'lucide-react';
import { SmartImage } from '@/components/shared/smart-image';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/context';

interface GalleryProps {
  images: string[];
  title: string;
  reference: string;
}

/**
 * Editorial gallery: one lead frame, a stacked pair, and a filmstrip.
 * Any frame opens the lightbox with keyboard navigation.
 */
export function PropertyGallery({ images, title, reference }: GalleryProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  const show = React.useCallback(
    (next: number) => setIndex((next + images.length) % images.length),
    [images.length],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') show(index + 1);
      if (event.key === 'ArrowLeft') show(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, show]);

  const openAt = (next: number) => {
    setIndex(next);
    setOpen(true);
  };

  return (
    <section aria-label={t.common.photographs}>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="tick-frame group relative aspect-[4/3] overflow-hidden rounded-lg md:aspect-[16/11]"
        >
          <SmartImage
            src={images[0] as string}
            alt={`${title} — lead photograph`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            fallbackSeed={`${reference}-0`}
            className="transition-transform duration-700 ease-entrance group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-4 left-4 rounded-full bg-foreground/75 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-background">
            {reference} · plate 01
          </span>
        </button>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          {[1, 2].map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => openAt(position)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg md:aspect-auto"
            >
              <SmartImage
                src={images[position] as string}
                alt={`${title} — photograph ${position + 1}`}
                fill
                sizes="33vw"
                fallbackSeed={`${reference}-${position}`}
                className="transition-transform duration-700 ease-entrance group-hover:scale-[1.04]"
              />
              {position === 2 ? (
                <span className="absolute inset-0 grid place-items-center bg-foreground/45 font-mono text-xs uppercase tracking-[0.16em] text-background opacity-0 transition-opacity group-hover:opacity-100">
                  <Expand className="mb-2 size-5" />
                  {t.common.openGallery}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
        {images.map((image, position) => (
          <button
            key={image}
            type="button"
            onClick={() => openAt(position)}
            aria-label={`${t.common.openPhotoPrefix} ${position + 1}`}
            className={cn(
              'relative h-20 w-28 shrink-0 overflow-hidden rounded-sm border-2 transition-colors',
              position === index ? 'border-brass' : 'border-transparent hover:border-border',
            )}
          >
            <SmartImage
              src={image}
              alt=""
              fill
              sizes="112px"
              fallbackSeed={`${reference}-thumb-${position}`}
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => openAt(0)}
          className="grid h-20 w-28 shrink-0 place-items-center rounded-sm border border-dashed border-border font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted"
        >
          <Images className="mb-1 size-4" />
          {images.length} {t.common.platesSuffix}
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} variant="panel">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-foreground">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <SmartImage
                src={images[index] as string}
                alt={`${title} — photograph ${index + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                fallbackSeed={`${reference}-light-${index}`}
              />
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => show(index - 1)}
            aria-label={t.common.previousPhoto}
            className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 hover:bg-background"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => show(index + 1)}
            aria-label={t.common.nextPhoto}
            className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 hover:bg-background"
          >
            <ChevronRight className="size-5" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em]">
            {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>
        </div>
      </Modal>
    </section>
  );
}
