'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bath,
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Maximize,
  Minimize,
  Pause,
  Phone,
  Play,
  Ruler,
  Trees,
} from 'lucide-react';
import type { Property } from '@/types';
import { SmartImage } from '@/components/shared/smart-image';
import { formatListingPrice, formatNumber, getStatusLabel, getTypeLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface SlideshowProperty {
  id: string;
  slug: string;
  reference: string;
  title: string;
  status: Property['status'];
  type: Property['type'];
  price: number;
  pricePeriod: Property['pricePeriod'];
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  landArea: number;
  featured: boolean;
  images: string[];
}

interface PropertySlideshowProps {
  properties: SlideshowProperty[];
  /** Time each property stays on screen. */
  intervalMs: number;
  contact: { name: string; phone: string; site: string };
}

const TICK_MS = 200;
const FADE_S = 1.4;
/** Re-fetch the listing set so a screen left on for days shows new publications. */
const REFRESH_MS = 10 * 60 * 1000;
const CONTROLS_IDLE_MS = 3000;
const IMAGE_QUALITY = 95;

type State = { index: number; elapsed: number };
type Action =
  | { type: 'tick'; delta: number; count: number; intervalMs: number }
  | { type: 'go'; to: number; count: number };

function reducer(state: State, action: Action): State {
  if (action.type === 'go') {
    const count = Math.max(action.count, 1);
    return { index: ((action.to % count) + count) % count, elapsed: 0 };
  }
  const elapsed = state.elapsed + action.delta;
  if (elapsed >= action.intervalMs) {
    return { index: (state.index + 1) % Math.max(action.count, 1), elapsed: 0 };
  }
  return { ...state, elapsed };
}

export function PropertySlideshow({ properties, intervalMs, contact }: PropertySlideshowProps) {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const count = properties.length;

  const [{ index: rawIndex, elapsed }, dispatch] = React.useReducer(reducer, {
    index: 0,
    elapsed: 0,
  });
  const [paused, setPaused] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [failedUrls, setFailedUrls] = React.useState<Record<string, true>>({});

  // The list can shrink after a refresh — never point past its end.
  const index = count ? rawIndex % count : 0;
  const slide = properties[index];
  const nextSlide = count > 1 ? properties[(index + 1) % count] : undefined;

  const validImages = React.useMemo(
    () => (slide ? slide.images.filter((url) => Boolean(url) && !failedUrls[url]) : []),
    [slide, failedUrls],
  );
  const imageCount = Math.max(validImages.length, 1);
  const imageDuration = intervalMs / imageCount;
  const imageIndex = Math.min(Math.floor(elapsed / imageDuration), imageCount - 1);
  const currentImageSrc = validImages[imageIndex] ?? validImages[0] ?? '';

  const markImageFailed = React.useCallback((url: string) => {
    if (!url) return;
    setFailedUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }, []);

  const go = React.useCallback((to: number) => dispatch({ type: 'go', to, count }), [count]);

  // Playback clock. Accumulates real elapsed time so pausing freezes progress.
  React.useEffect(() => {
    if (paused || !count) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'tick', delta: now - last, count, intervalMs });
      last = now;
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [paused, count, intervalMs]);

  // Pull fresh listings periodically (page is force-dynamic).
  React.useEffect(() => {
    const id = window.setInterval(() => router.refresh(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [router]);

  // Keep TVs / monitors from dimming or sleeping while the show runs.
  React.useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        // Not allowed (e.g. tab hidden) — retried on visibility change.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release();
    };
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void rootRef.current?.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Keyboard / TV-remote control.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          go(index + 1);
          break;
        case 'ArrowLeft':
          go(index - 1);
          break;
        case ' ':
        case 'Enter':
        case 'MediaPlayPause':
          event.preventDefault();
          setPaused((value) => !value);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        default:
          return;
      }
      setControlsVisible(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, toggleFullscreen]);

  // Controls + cursor appear on activity and hide again when idle.
  React.useEffect(() => {
    if (!controlsVisible) return;
    const id = window.setTimeout(() => setControlsVisible(false), CONTROLS_IDLE_MS);
    return () => window.clearTimeout(id);
  }, [controlsVisible, elapsed]);

  if (!slide) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-[#0A0F0D] text-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            src="/images/logo-sarango-real.jpeg"
            alt={contact.name}
            width={120}
            height={120}
            className="rounded-full"
          />
          <p className="font-display text-[3vw]">{contact.name}</p>
          <p className="text-[1.4vw] text-white/60">
            Muy pronto nuevas propiedades disponibles · {contact.phone}
          </p>
        </div>
      </div>
    );
  }

  const progress = Math.min(elapsed / intervalMs, 1);
  const specs = buildSpecs(slide);

  return (
    <div
      ref={rootRef}
      onMouseMove={() => setControlsVisible(true)}
      onDoubleClick={toggleFullscreen}
      className={cn(
        'fixed inset-0 select-none overflow-hidden bg-black text-white',
        !controlsVisible && 'cursor-none',
      )}
    >
      {/* ── Photography ─────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`${slide.id}-${currentImageSrc || imageIndex}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_S, ease: 'easeInOut' }}
        >
          {currentImageSrc ? (
            <div
              className="absolute inset-0 will-change-transform"
              style={{
                animation: `slideshow-kenburns ${imageDuration + FADE_S * 1000}ms ease-out forwards`,
                animationPlayState: paused ? 'paused' : 'running',
                transformOrigin: KEN_BURNS_ORIGINS[(index + imageIndex) % KEN_BURNS_ORIGINS.length],
              }}
            >
              <SmartImage
                src={currentImageSrc}
                alt={slide.title}
                fill
                priority
                sizes="100vw"
                quality={IMAGE_QUALITY}
                fallbackSeed={slide.id}
                onError={() => markImageFailed(currentImageSrc)}
              />
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#0A0F0D] via-[#121C18] to-[#0A0F0D]">
              <Image
                src="/images/logo-sarango-real.jpeg"
                alt={contact.name}
                width={220}
                height={220}
                unoptimized
                className="rounded-full opacity-20 ring-1 ring-white/15"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Preload the next photo so cross-fades never reveal a blank frame. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0">
        {[
          validImages[imageIndex + 1],
          nextSlide?.images.find((url) => Boolean(url) && !failedUrls[url]),
        ]
          .filter((src): src is string => Boolean(src))
          .map((src, i) => (
            <Image
              key={`${i}-${src}`}
              src={src}
              alt=""
              fill
              sizes="100vw"
              quality={IMAGE_QUALITY}
              unoptimized={src.startsWith('/uploads/')}
              onError={() => markImageFailed(src)}
            />
          ))}
      </div>

      {/* Legibility scrims */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/70 to-transparent" />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-[4vw] pt-[3vh]">
        <div className="flex items-center gap-[1vw]">
          <Image
            src="/images/logo-sarango-real.jpeg"
            alt=""
            width={96}
            height={96}
            className="size-[4.2vw] min-h-10 min-w-10 rounded-full ring-2 ring-white/20"
          />
          <div className="leading-tight">
            <p className="font-display text-[1.7vw] font-semibold">{contact.name}</p>
            <p className="text-[0.9vw] uppercase tracking-[0.25em] text-white/60">
              Bienes raíces · Ecuador
            </p>
          </div>
        </div>
        <div className="flex items-center gap-[2vw] text-[1.1vw] text-white/80">
          <Clock />
          <span className="font-mono tabular-nums">
            {String(index + 1).padStart(2, '0')}
            <span className="text-white/40"> / {String(count).padStart(2, '0')}</span>
          </span>
        </div>
      </header>

      {/* ── Listing details ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.section
          key={slide.id}
          className="absolute bottom-[12vh] left-[4vw] max-w-[58vw]"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
            exit: { opacity: 0, transition: { duration: 0.5 } },
          }}
        >
          <motion.div variants={ITEM} className="mb-[2vh] flex flex-wrap gap-[0.6vw]">
            <Pill className="bg-[hsl(38_52%_60%)] text-[hsl(40_40%_10%)]">
              {getStatusLabel(slide.status, 'es')}
            </Pill>
            <Pill className="bg-white/15 backdrop-blur">{getTypeLabel(slide.type, 'es')}</Pill>
            {slide.featured ? <Pill className="bg-white/15 backdrop-blur">★ Destacada</Pill> : null}
          </motion.div>

          <motion.h1
            variants={ITEM}
            className="line-clamp-2 font-display text-[3.8vw] font-semibold leading-[1.02] tracking-[-0.02em] text-white"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            variants={ITEM}
            className="mt-[1.6vh] flex items-center gap-[0.5vw] text-[1.35vw] text-white/80"
          >
            <MapPin className="size-[1.4vw] shrink-0 text-[hsl(38_52%_60%)]" />
            <span className="line-clamp-1">
              {slide.address ? `${slide.address}, ` : ''}
              {slide.city}
            </span>
          </motion.p>

          {specs.length ? (
            <motion.ul variants={ITEM} className="mt-[3vh] flex flex-wrap gap-[2.4vw]">
              {specs.map(({ icon: Icon, value, label }) => (
                <li key={label} className="flex items-center gap-[0.7vw]">
                  <Icon className="size-[2vw] text-[hsl(38_52%_60%)]" strokeWidth={1.5} />
                  <div className="leading-tight">
                    <p className="text-[1.7vw] font-semibold tabular-nums">{value}</p>
                    <p className="text-[0.85vw] uppercase tracking-[0.18em] text-white/60">
                      {label}
                    </p>
                  </div>
                </li>
              ))}
            </motion.ul>
          ) : null}

          <motion.p
            variants={ITEM}
            className="mt-[3.5vh] font-display text-[4.4vw] font-semibold tabular-nums leading-none text-[hsl(38_52%_60%)]"
          >
            {formatListingPrice(slide.price, slide.pricePeriod, 'es')}
          </motion.p>
        </motion.section>
      </AnimatePresence>

      {/* ── Call to action ──────────────────────────────────────── */}
      <aside className="absolute bottom-[12vh] right-[4vw] w-[24vw] rounded-[1.2vw] border border-white/15 bg-black/45 p-[1.6vw] backdrop-blur-md">
        <p className="text-[0.85vw] uppercase tracking-[0.25em] text-[hsl(38_52%_60%)]">
          Agenda tu visita
        </p>
        <p className="mt-[1vh] flex items-center gap-[0.6vw] text-[1.9vw] font-semibold tabular-nums">
          <Phone className="size-[1.6vw]" />
          {contact.phone}
        </p>
        <p className="mt-[1vh] flex items-center gap-[0.6vw] text-[1.05vw] text-white/80">
          <Globe className="size-[1.1vw] shrink-0" />
          <span className="truncate">{contact.site}</span>
        </p>
        <p className="mt-[1.6vh] border-t border-white/10 pt-[1.4vh] font-mono text-[0.9vw] text-white/50">
          Ref. {slide.reference}
        </p>
      </aside>

      {/* ── Footer: progress + up next ──────────────────────────── */}
      <footer className="absolute inset-x-0 bottom-0 px-[4vw] pb-[4vh]">
        <div className="mb-[1.6vh] flex items-center justify-between text-[0.95vw] text-white/60">
          <div className="flex gap-[0.4vw]">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-[0.35vw] w-[1.6vw] rounded-full transition-colors duration-500',
                  i === imageIndex ? 'bg-white' : 'bg-white/25',
                )}
              />
            ))}
          </div>
          {nextSlide ? (
            <p className="truncate pl-[2vw]">
              <span className="uppercase tracking-[0.2em] text-white/40">Siguiente · </span>
              {nextSlide.title}
            </p>
          ) : null}
        </div>
        <div className="h-[0.35vh] min-h-[3px] w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full origin-left bg-[hsl(38_52%_60%)]"
            style={{
              transform: `scaleX(${progress})`,
              transition: progress === 0 ? 'none' : `transform ${TICK_MS}ms linear`,
            }}
          />
        </div>
      </footer>

      {/* ── On-demand controls (mouse / keyboard) ───────────────── */}
      <div
        className={cn(
          'absolute left-1/2 top-[3vh] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/60 p-1.5 backdrop-blur transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ControlButton label="Anterior" onClick={() => go(index - 1)}>
          <ChevronLeft className="size-5" />
        </ControlButton>
        <ControlButton
          label={paused ? 'Reproducir' : 'Pausar'}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
        </ControlButton>
        <ControlButton label="Siguiente" onClick={() => go(index + 1)}>
          <ChevronRight className="size-5" />
        </ControlButton>
        <ControlButton
          label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </ControlButton>
      </div>

      {paused ? (
        <div className="absolute right-[4vw] top-[12vh] flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[0.9vw] uppercase tracking-[0.2em] backdrop-blur">
          <Pause className="size-4" /> En pausa
        </div>
      ) : null}
    </div>
  );
}

const ITEM = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const KEN_BURNS_ORIGINS = ['center center', 'left top', 'right bottom', 'right top', 'left bottom'];

function buildSpecs(slide: SlideshowProperty) {
  const specs: { icon: typeof BedDouble; value: string; label: string }[] = [];
  if (slide.bedrooms > 0) {
    specs.push({ icon: BedDouble, value: String(slide.bedrooms), label: 'Habitaciones' });
  }
  if (slide.bathrooms > 0) {
    specs.push({ icon: Bath, value: String(slide.bathrooms), label: 'Baños' });
  }
  if (slide.garages > 0) {
    specs.push({ icon: Car, value: String(slide.garages), label: 'Garajes' });
  }
  if (slide.area > 0) {
    specs.push({ icon: Ruler, value: `${formatNumber(slide.area)} m²`, label: 'Construcción' });
  }
  if (slide.landArea > 0) {
    specs.push({ icon: Trees, value: `${formatNumber(slide.landArea)} m²`, label: 'Terreno' });
  }
  return specs;
}

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-full px-[1vw] py-[0.45vh] text-[0.9vw] font-semibold uppercase tracking-[0.16em]',
        className,
      )}
    >
      {children}
    </span>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onDoubleClick={(event) => event.stopPropagation()}
      className="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
    >
      {children}
    </button>
  );
}

/** Rendered client-only to avoid a server/client time mismatch on hydration. */
function Clock() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 15_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;
  return (
    <span className="tabular-nums">
      {now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}
