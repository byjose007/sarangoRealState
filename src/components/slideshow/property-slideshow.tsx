'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Bath,
  BedDouble,
  Building2,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  FileCheck2,
  Globe,
  Handshake,
  KeyRound,
  MapPin,
  Maximize,
  Megaphone,
  Minimize,
  Monitor,
  Moon,
  Pause,
  PawPrint,
  Phone,
  Play,
  QrCode,
  Ruler,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  TrendingUp,
  Trees,
} from 'lucide-react';
import type { Property } from '@/types';
import { SmartImage } from '@/components/shared/smart-image';
import { QrCodeSvg } from '@/components/slideshow/qr-code-svg';
import { formatListingPrice, formatNumber, getStatusLabel, getTypeLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

export type SlideshowFormat = 'auto' | 'landscape' | 'portrait';

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
  utilitiesIncluded?: boolean;
  petsAllowed?: boolean;
  hoaFee?: number;
  images: string[];
}

export interface SlideshowWeather {
  tempC: number;
  weatherCode: number;
  isDay: boolean;
}

interface PromoCampaign {
  id: string;
  eyebrow: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  whatsappText: string;
  backgroundImage: string;
  highlights: { icon: typeof Building2; title: string; detail: string }[];
}

type DeckItem =
  | { kind: 'property'; key: string; property: SlideshowProperty }
  | { kind: 'promo'; key: string; promo: PromoCampaign }
  | { kind: 'brand'; key: string };

interface PropertySlideshowProps {
  properties: SlideshowProperty[];
  /** Time each property stays on screen. */
  intervalMs: number;
  /** Whether to append the institutional brand/logo slide at the end of all publications. */
  showBrandSlide?: boolean;
  /** Whether to intercalate promotional service slides between property listings. */
  showPromoSlides?: boolean;
  /** Initial display orientation mode ('auto' | 'landscape' | 'portrait'). */
  initialFormat?: SlideshowFormat;
  initialWeather?: SlideshowWeather | null;
  contact: {
    name: string;
    tagline?: string;
    phone: string;
    whatsapp?: string;
    site: string;
    url?: string;
    hours?: string;
    officeCity?: string;
    officeAddress?: string;
    coordinates?: { lat: number; lng: number };
  };
}

const TICK_MS = 200;
const FADE_S = 1.4;
/** Re-fetch the listing set so a screen left on for days shows new publications. */
const REFRESH_MS = 10 * 60 * 1000;
const WEATHER_REFRESH_MS = 15 * 60 * 1000;
const CONTROLS_IDLE_MS = 3500;
const IMAGE_QUALITY = 95;
const PROMO_INTERVAL_COUNT = 3;

const PROMO_CAMPAIGNS: PromoCampaign[] = [
  {
    id: 'promo-captacion',
    eyebrow: 'Captación de Propietarios · Cuenca',
    badge: '¿Deseas vender o alquilar?',
    title: 'Vendemos o alquilamos tu propiedad sin sorpresas ocultas',
    subtitle:
      'Medimos cada plano, producimos fotografía profesional, exhibimos tu inmueble en pantallas comerciales y filtramos compradores reales.',
    ctaLabel: 'Consigna tu propiedad por WhatsApp',
    whatsappText:
      'Hola Sarango Real Estate, vi la pantalla en el centro comercial y deseo información para vender o alquilar mi propiedad.',
    backgroundImage: '/images/sarango-office.webp',
    highlights: [
      {
        icon: FileCheck2,
        title: 'Auditoría y Avalúo Real',
        detail: 'Planos medidos, revisión documental y precio competitivo de mercado.',
      },
      {
        icon: TrendingUp,
        title: 'Máxima Exposición Comercial',
        detail: 'Presencia en pantallas de alto tráfico, portal web y redes sociales.',
      },
      {
        icon: Handshake,
        title: 'Gestión Integral y Segura',
        detail: 'Visitas calificadas, contratos verificados y acompañamiento hasta notaría.',
      },
    ],
  },
  {
    id: 'promo-compradores',
    eyebrow: 'Asesoría Inmobiliaria y Financiamiento',
    badge: 'Compra e Inversión Segura',
    title: 'Encuentra tu próximo hogar o inversión con respaldo técnico',
    subtitle:
      'Cada propiedad de nuestro catálogo ha sido inspeccionada y documentada previamente para que tomes decisiones con total certeza.',
    ctaLabel: 'Solicita asesoría personalizada',
    whatsappText:
      'Hola Sarango Real Estate, vi la pantalla en el centro comercial y busco asesoría para comprar o alquilar una propiedad.',
    backgroundImage: '/images/sarango-meeting-room.webp',
    highlights: [
      {
        icon: ShieldCheck,
        title: 'Cero Sorpresas Técnicas',
        detail: 'Inspección previa de instalaciones, metrajes reales y estado legal.',
      },
      {
        icon: KeyRound,
        title: 'Crédito Hipotecario y Legal',
        detail: 'Coordinamos avalúos bancarios, financiamiento y escrituración.',
      },
      {
        icon: Award,
        title: 'Atención Personalizada',
        detail: 'Recorridos presenciales o en video en vivo si resides en el exterior.',
      },
    ],
  },
];

function buildSlideDeck(
  properties: SlideshowProperty[],
  showPromoSlides: boolean,
  showBrandSlide: boolean,
): DeckItem[] {
  const deck: DeckItem[] = [];
  let promoCursor = 0;

  properties.forEach((property, idx) => {
    deck.push({ kind: 'property', key: `prop-${property.id}`, property });

    const countSoFar = idx + 1;
    const isLastProperty = countSoFar === properties.length;

    // Intercalate a promotional slide every N properties, or right after the properties
    // when the catalogue has fewer than N items so mall visitors still see the promo campaign.
    if (
      showPromoSlides &&
      (countSoFar % PROMO_INTERVAL_COUNT === 0 ||
        (isLastProperty && properties.length < PROMO_INTERVAL_COUNT))
    ) {
      const promo = PROMO_CAMPAIGNS[promoCursor % PROMO_CAMPAIGNS.length];
      deck.push({
        kind: 'promo',
        key: `promo-${promo.id}-${idx}`,
        promo,
      });
      promoCursor += 1;
    }
  });

  if (showBrandSlide || deck.length === 0) {
    deck.push({ kind: 'brand', key: 'brand-outro' });
  }

  return deck;
}

type State = { index: number; elapsed: number };
type Action =
  | { type: 'tick'; delta: number; totalSlides: number; intervalMs: number }
  | { type: 'go'; to: number; totalSlides: number };

function reducer(state: State, action: Action): State {
  if (action.type === 'go') {
    const total = Math.max(action.totalSlides, 1);
    return { index: ((action.to % total) + total) % total, elapsed: 0 };
  }
  const elapsed = state.elapsed + action.delta;
  if (elapsed >= action.intervalMs) {
    return { index: (state.index + 1) % Math.max(action.totalSlides, 1), elapsed: 0 };
  }
  return { ...state, elapsed };
}

export function PropertySlideshow({
  properties,
  intervalMs,
  showBrandSlide = true,
  showPromoSlides = true,
  initialFormat = 'auto',
  initialWeather = null,
  contact,
}: PropertySlideshowProps) {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const deck = React.useMemo(
    () => buildSlideDeck(properties, showPromoSlides, showBrandSlide),
    [properties, showPromoSlides, showBrandSlide],
  );
  const totalSlides = deck.length;

  const [{ index: rawIndex, elapsed }, dispatch] = React.useReducer(reducer, {
    index: 0,
    elapsed: 0,
  });
  const [paused, setPaused] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [failedUrls, setFailedUrls] = React.useState<Record<string, true>>({});
  const [formatMode, setFormatMode] = React.useState<SlideshowFormat>(initialFormat);
  const [viewportPortrait, setViewportPortrait] = React.useState(false);

  // Detect physical portrait orientation for 9:16 mall digital totems.
  React.useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');
    const onChange = () => setViewportPortrait(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const isPortrait = formatMode === 'portrait' || (formatMode === 'auto' && viewportPortrait);
  const isSimulatedPortrait = formatMode === 'portrait' && !viewportPortrait;

  // The list can shrink after a refresh — never point past its end.
  const index = totalSlides ? rawIndex % totalSlides : 0;
  const currentItem = deck[index] ?? { kind: 'brand', key: 'brand-outro' };
  const nextItem = deck[(index + 1) % totalSlides] ?? currentItem;

  const slide = currentItem.kind === 'property' ? currentItem.property : undefined;
  const promo = currentItem.kind === 'promo' ? currentItem.promo : undefined;

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

  const go = React.useCallback(
    (to: number) => dispatch({ type: 'go', to, totalSlides }),
    [totalSlides],
  );

  const cycleFormatMode = React.useCallback(() => {
    setFormatMode((prev) => {
      if (prev === 'auto') return viewportPortrait ? 'landscape' : 'portrait';
      if (prev === 'portrait') return 'landscape';
      return 'auto';
    });
  }, [viewportPortrait]);

  // Playback clock. Accumulates real elapsed time so pausing freezes progress.
  React.useEffect(() => {
    if (paused || totalSlides <= 0) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'tick', delta: now - last, totalSlides, intervalMs });
      last = now;
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [paused, totalSlides, intervalMs]);

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
        case 'v':
        case 'V':
          cycleFormatMode();
          break;
        default:
          return;
      }
      setControlsVisible(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, toggleFullscreen, cycleFormatMode]);

  // Controls + cursor appear on activity and hide again when idle.
  React.useEffect(() => {
    if (!controlsVisible) return;
    const id = window.setTimeout(() => setControlsVisible(false), CONTROLS_IDLE_MS);
    return () => window.clearTimeout(id);
  }, [controlsVisible, elapsed]);

  const progress = Math.min(elapsed / intervalMs, 1);
  const specs = slide ? buildSpecs(slide) : [];

  const whatsappDigits = (contact.whatsapp || contact.phone).replace(/\D/g, '');
  const qrUrl = React.useMemo(() => {
    if (slide) {
      return whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, vi en pantalla la propiedad Ref. ${slide.reference}`)}`
        : `${contact.url || `https://${contact.site}`}/properties/${slide.slug}`;
    }
    if (promo) {
      return whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(promo.whatsappText)}`
        : contact.url || `https://${contact.site}`;
    }
    return whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hola, vi su pantalla en el centro comercial y deseo información')}`
      : contact.url || `https://${contact.site}`;
  }, [slide, promo, whatsappDigits, contact.url, contact.site]);

  const nextSlideLabel = React.useMemo(() => {
    if (nextItem.kind === 'property') return nextItem.property.title;
    if (nextItem.kind === 'promo') return `${nextItem.promo.badge} · ${contact.name}`;
    return `${contact.name} — Contacto y Ubicación`;
  }, [nextItem, contact.name]);

  const kindLabel =
    currentItem.kind === 'property'
      ? 'Propiedad'
      : currentItem.kind === 'promo'
        ? 'Destacado'
        : 'Institucional';

  return (
    <div
      ref={rootRef}
      onMouseMove={() => setControlsVisible(true)}
      onDoubleClick={toggleFullscreen}
      className={cn(
        'fixed inset-0 select-none overflow-hidden bg-[#050807] text-white',
        !controlsVisible && 'cursor-none',
        isSimulatedPortrait && 'grid place-items-center',
      )}
    >
      {/* Ambient backdrop when previewing 9:16 Vertical Totem on a horizontal monitor */}
      {isSimulatedPortrait ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(38_52%_60%/0.14),transparent_70%)]"
        />
      ) : null}

      {/* Stage container: fills 100dvw/100dvh normally, or frames a 9:16 totem when previewed on desktop */}
      <div
        className={cn(
          'relative overflow-hidden bg-[#0A0F0D]',
          isSimulatedPortrait
            ? 'aspect-[9/16] h-[96dvh] max-w-[96dvw] rounded-[2rem] border border-white/20 shadow-[0_0_90px_rgba(0,0,0,0.9)]'
            : 'h-dvh w-dvw',
        )}
      >
        {/* ── Background Layer ───────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {currentItem.kind === 'brand' ? (
            <motion.div
              key="brand-outro-bg"
              className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#070B0A] via-[#0E1915] to-[#080D0B]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: FADE_S, ease: 'easeInOut' }}
            >
              {properties[0]?.images[0] && !failedUrls[properties[0].images[0]] ? (
                <div className="absolute inset-0 opacity-15 mix-blend-luminosity">
                  <SmartImage
                    src={properties[0].images[0]}
                    alt=""
                    fill
                    sizes="100vw"
                    quality={75}
                    className="scale-105 object-cover blur-sm"
                  />
                </div>
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_45%,hsl(38_52%_60%/0.18),transparent_62%),radial-gradient(circle_at_80%_20%,hsl(168_38%_52%/0.14),transparent_55%)]" />
            </motion.div>
          ) : currentItem.kind === 'promo' && promo ? (
            <motion.div
              key={currentItem.key}
              className="absolute inset-0 overflow-hidden bg-[#09110E]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: FADE_S, ease: 'easeInOut' }}
            >
              <div
                className="absolute inset-0 opacity-30 will-change-transform"
                style={{
                  animation: `slideshow-kenburns ${intervalMs + FADE_S * 1000}ms ease-out forwards`,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
              >
                <Image
                  src={promo.backgroundImage}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#070D0B]/95 via-[#0E1B16]/85 to-[#070D0B]/95" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,hsl(38_52%_60%/0.2),transparent_60%)]" />
            </motion.div>
          ) : (
            <motion.div
              key={`${slide?.id}-${currentImageSrc || imageIndex}`}
              className={cn('absolute inset-x-0 top-0', isPortrait ? 'h-[52%]' : 'inset-0')}
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
                    transformOrigin:
                      KEN_BURNS_ORIGINS[(index + imageIndex) % KEN_BURNS_ORIGINS.length],
                  }}
                >
                  <SmartImage
                    src={currentImageSrc}
                    alt={slide?.title ?? contact.name}
                    fill
                    priority
                    sizes="100vw"
                    quality={IMAGE_QUALITY}
                    fallbackSeed={slide?.id}
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
          )}
        </AnimatePresence>

        {/* Preload the next photo so cross-fades never reveal a blank frame. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0">
          {[
            validImages[imageIndex + 1],
            nextItem.kind === 'property'
              ? nextItem.property.images.find((url) => Boolean(url) && !failedUrls[url])
              : undefined,
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

        {/* Legibility scrims adapted for Landscape 16:9 vs Portrait 9:16 Totem */}
        {isPortrait ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-black/85 via-black/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[34%] bg-gradient-to-t from-[#070C0A] via-[#070C0A]/95 to-transparent" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/25" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[24%] bg-gradient-to-b from-black/80 via-black/35 to-transparent" />
          </>
        )}

        {/* ── Top Bar: Brand Identity + Live Mall Info (Weather, Time, Slide) ── */}
        <header
          className={cn(
            'absolute inset-x-0 top-0 z-10 flex items-center justify-between',
            isPortrait ? 'px-5 pt-4' : 'px-[4vw] pt-[2.8vh]',
          )}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-sarango-real.jpeg"
              alt={contact.name}
              width={96}
              height={96}
              className={cn(
                'rounded-full object-cover shadow-lg ring-2 ring-[hsl(38_52%_60%/0.65)]',
                isPortrait ? 'size-11' : 'size-[4.2vw] min-h-11 min-w-11',
              )}
            />
            <div className="leading-tight">
              <p
                className={cn(
                  'font-display font-semibold tracking-tight text-white drop-shadow',
                  isPortrait
                    ? 'text-[clamp(1rem,2.4vmin,1.35rem)]'
                    : 'text-[clamp(1.1rem,1.75vw,2.2rem)]',
                )}
              >
                {contact.name}
              </p>
              <p
                className={cn(
                  'font-medium uppercase tracking-[0.22em] text-[hsl(38_52%_60%)]',
                  isPortrait
                    ? 'text-[clamp(0.58rem,1.2vmin,0.75rem)]'
                    : 'text-[clamp(0.65rem,0.85vw,1.05rem)]',
                )}
              >
                Bienes raíces · {contact.officeCity ?? 'Cuenca'}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex items-center rounded-2xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-md',
              isPortrait ? 'gap-2.5 px-3 py-1.5' : 'gap-[1.4vw] px-[1.5vw] py-[1vh]',
            )}
          >
            <WeatherWidget
              city={contact.officeCity ?? 'Cuenca'}
              coordinates={contact.coordinates ?? { lat: -2.9001, lng: -79.0059 }}
              initialWeather={initialWeather}
              compact={isPortrait}
            />
            <span className="h-6 w-px bg-white/15" aria-hidden />
            <ClockWidget compact={isPortrait} />
            <span className="h-6 w-px bg-white/15" aria-hidden />
            <div className="flex flex-col items-end leading-tight">
              <span
                className={cn(
                  'font-semibold uppercase tracking-[0.2em] text-white/50',
                  isPortrait ? 'text-[0.55rem]' : 'text-[clamp(0.55rem,0.68vw,0.85rem)]',
                )}
              >
                {kindLabel}
              </span>
              <span
                className={cn(
                  'font-mono font-semibold tabular-nums text-white',
                  isPortrait ? 'text-xs' : 'text-[clamp(0.85rem,1.2vw,1.5rem)]',
                )}
              >
                {String(index + 1).padStart(2, '0')}
                <span className="text-white/40"> / {String(totalSlides).padStart(2, '0')}</span>
              </span>
            </div>
          </div>
        </header>

        {/* ── Main Content Stage ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {currentItem.kind === 'brand' ? (
            <BrandOutroSlide
              key="brand-outro-content"
              contact={contact}
              qrUrl={qrUrl}
              propertyCount={properties.length}
              isPortrait={isPortrait}
            />
          ) : currentItem.kind === 'promo' && promo ? (
            <PromoInterstitialSlide
              key={currentItem.key}
              promo={promo}
              contact={contact}
              qrUrl={qrUrl}
              isPortrait={isPortrait}
            />
          ) : slide ? (
            <PropertySlideView
              key={slide.id}
              slide={slide}
              specs={specs}
              contact={contact}
              qrUrl={qrUrl}
              paused={paused}
              intervalMs={intervalMs}
              isPortrait={isPortrait}
            />
          ) : null}
        </AnimatePresence>

        {/* ── Footer: Photo Progress + Next Slide Preview + Brand Seal ── */}
        <footer
          className={cn(
            'absolute inset-x-0 bottom-0 z-10',
            isPortrait ? 'px-5 pb-3.5' : 'px-[4vw] pb-[3.2vh]',
          )}
        >
          <div
            className={cn(
              'mb-2 flex items-center justify-between gap-3 text-white/70',
              isPortrait ? 'text-xs' : 'text-[clamp(0.75rem,0.92vw,1.15rem)]',
            )}
          >
            <div className="flex items-center gap-2">
              {currentItem.kind === 'property' ? (
                <>
                  <div className="flex gap-1.5">
                    {validImages.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-500',
                          i === imageIndex ? 'w-6 bg-[hsl(38_52%_60%)]' : 'w-3 bg-white/25',
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[0.85em] tabular-nums text-white/55">
                    Foto {imageIndex + 1}/{imageCount}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.85em] uppercase tracking-[0.18em] text-[hsl(38_52%_60%)]">
                  <Sparkles className="size-3.5" />
                  {currentItem.kind === 'promo'
                    ? promo?.eyebrow
                    : `Presentación Oficial · ${contact.name}`}
                </span>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-3">
              {totalSlides > 1 ? (
                <p className={cn('truncate', isPortrait ? 'max-w-[42%]' : 'max-w-[38vw]')}>
                  <span className="uppercase tracking-[0.18em] text-white/45">Siguiente · </span>
                  <span className="font-medium text-white/85">{nextSlideLabel}</span>
                </p>
              ) : null}

              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 backdrop-blur-sm">
                <Image
                  src="/images/logo-sarango-real.jpeg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-4 rounded-full"
                />
                <span className="font-display text-[0.85em] font-medium text-white/90">
                  {contact.name}
                </span>
              </div>
            </div>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full origin-left bg-[hsl(38_52%_60%)]"
              style={{
                transform: `scaleX(${progress})`,
                transition: progress === 0 ? 'none' : `transform ${TICK_MS}ms linear`,
              }}
            />
          </div>
        </footer>
      </div>

      {/* ── On-demand controls (mouse / keyboard / remote) ───────────────── */}
      <div
        className={cn(
          'absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/75 p-1.5 shadow-xl backdrop-blur-md transition-opacity duration-300',
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
          label={
            isPortrait
              ? 'Cambiar a modo TV Horizontal (16:9)'
              : 'Cambiar a modo Tótem Vertical (9:16)'
          }
          onClick={cycleFormatMode}
        >
          {isPortrait ? <Monitor className="size-5" /> : <Smartphone className="size-5" />}
        </ControlButton>
        <ControlButton
          label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </ControlButton>
      </div>

      {paused ? (
        <div className="absolute right-6 top-20 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-4 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-md">
          <Pause className="size-4 text-[hsl(38_52%_60%)]" /> En pausa
        </div>
      ) : null}
    </div>
  );
}

/**
 * Property listing slide view that adapts between 16:9 Horizontal TV and 9:16 Vertical Totem.
 */
function PropertySlideView({
  slide,
  specs,
  contact,
  qrUrl,
  paused,
  intervalMs,
  isPortrait,
}: {
  slide: SlideshowProperty;
  specs: ReturnType<typeof buildSpecs>;
  contact: PropertySlideshowProps['contact'];
  qrUrl: string;
  paused: boolean;
  intervalMs: number;
  isPortrait: boolean;
}) {
  if (isPortrait) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
          exit: { opacity: 0, transition: { duration: 0.4 } },
        }}
        className="absolute inset-x-5 bottom-14 top-[42%] z-10 flex flex-col justify-between"
      >
        <div>
          <motion.div variants={ITEM} className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <Pill isPortrait className="bg-[hsl(38_52%_60%)] text-[hsl(40_40%_10%)]">
              {getStatusLabel(slide.status, 'es')}
            </Pill>
            <Pill isPortrait className="border border-white/15 bg-white/15 backdrop-blur-md">
              {getTypeLabel(slide.type, 'es')}
            </Pill>
            {slide.featured ? (
              <Pill
                isPortrait
                className="border border-[hsl(38_52%_60%/0.4)] bg-[hsl(38_52%_60%/0.2)] text-[hsl(38_52%_75%)]"
              >
                ★ Destacada
              </Pill>
            ) : null}
            {slide.utilitiesIncluded ? (
              <Pill isPortrait className="border border-white/15 bg-white/10 text-white/90">
                Servicios incl.
              </Pill>
            ) : null}
          </motion.div>

          <motion.div variants={ITEM}>
            <ScrollingTitle
              title={slide.title}
              paused={paused}
              intervalMs={intervalMs}
              isPortrait
            />
          </motion.div>

          <motion.p
            variants={ITEM}
            className="mt-1.5 flex items-center gap-1.5 text-[clamp(0.9rem,2vmin,1.15rem)] font-medium text-white/85"
          >
            <MapPin className="size-4 shrink-0 text-[hsl(38_52%_60%)]" />
            <span className="line-clamp-1">
              {slide.address ? `${capitalizeFirst(slide.address)}, ` : ''}
              {slide.city}
            </span>
          </motion.p>

          {specs.length ? (
            <motion.ul variants={ITEM} className="mt-3.5 grid grid-cols-3 gap-2">
              {specs.slice(0, 3).map(({ icon: Icon, value, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-2"
                >
                  <Icon className="size-5 shrink-0 text-[hsl(38_52%_60%)]" strokeWidth={1.6} />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-bold tabular-nums">{value}</p>
                    <p className="truncate text-[0.62rem] uppercase tracking-[0.14em] text-white/60">
                      {label}
                    </p>
                  </div>
                </li>
              ))}
            </motion.ul>
          ) : null}

          <motion.div variants={ITEM} className="mt-3.5 flex items-baseline justify-between">
            <p className="font-display text-[clamp(2rem,5.2vmin,3rem)] font-semibold tabular-nums leading-none text-[hsl(38_52%_60%)]">
              {formatListingPrice(slide.price, slide.pricePeriod, 'es')}
            </p>
            <span className="font-mono text-xs text-white/55">Ref. {slide.reference}</span>
          </motion.div>
        </div>

        {/* Bottom Totem CTA + QR Card */}
        <motion.aside
          variants={ITEM}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-black/70 p-3.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-sarango-real.jpeg"
                alt=""
                width={32}
                height={32}
                className="size-6 rounded-full ring-1 ring-[hsl(38_52%_60%/0.6)]"
              />
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[hsl(38_52%_60%)]">
                Agenda tu visita hoy
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-[clamp(1.1rem,2.6vmin,1.45rem)] font-bold tabular-nums text-white">
              <Phone className="size-4 shrink-0 text-[hsl(38_52%_60%)]" />
              <span className="truncate">{contact.phone}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
              <Globe className="size-3.5 shrink-0 text-[hsl(38_52%_60%)]" />
              <span className="truncate">{contact.site}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="rounded-xl bg-white p-1.5 shadow-lg ring-2 ring-[hsl(38_52%_60%/0.55)]">
              <QrCodeSvg value={qrUrl} className="size-20" />
            </div>
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[hsl(38_52%_65%)]">
              Escanea el QR
            </span>
          </div>
        </motion.aside>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.45 } },
      }}
    >
      {/* Left column: Property details */}
      <section className="absolute bottom-[11.5vh] left-[4vw] w-[60vw] max-w-[60vw]">
        <motion.div variants={ITEM} className="mb-[1.8vh] flex flex-wrap items-center gap-[0.6vw]">
          <Pill className="bg-[hsl(38_52%_60%)] text-[hsl(40_40%_10%)] shadow-sm">
            {getStatusLabel(slide.status, 'es')}
          </Pill>
          <Pill className="border border-white/15 bg-white/15 backdrop-blur-md">
            {getTypeLabel(slide.type, 'es')}
          </Pill>
          {slide.featured ? (
            <Pill className="border border-[hsl(38_52%_60%/0.4)] bg-[hsl(38_52%_60%/0.2)] text-[hsl(38_52%_75%)] backdrop-blur-md">
              ★ Destacada
            </Pill>
          ) : null}
          {slide.utilitiesIncluded ? (
            <Pill className="inline-flex items-center gap-[0.35vw] border border-white/15 bg-white/10 text-white/90 backdrop-blur-md">
              <Droplets className="size-[0.9vw] text-[hsl(38_52%_60%)]" />
              Servicios incluidos
            </Pill>
          ) : null}
          {slide.petsAllowed ? (
            <Pill className="inline-flex items-center gap-[0.35vw] border border-white/15 bg-white/10 text-white/90 backdrop-blur-md">
              <PawPrint className="size-[0.9vw] text-[hsl(38_52%_60%)]" />
              Pet friendly
            </Pill>
          ) : null}
        </motion.div>

        <motion.div variants={ITEM}>
          <ScrollingTitle title={slide.title} paused={paused} intervalMs={intervalMs} />
        </motion.div>

        <motion.p
          variants={ITEM}
          className="mt-[1.4vh] flex items-center gap-[0.55vw] text-[clamp(1rem,1.35vw,1.75rem)] font-medium text-white/85"
        >
          <MapPin className="size-[1.45vw] shrink-0 text-[hsl(38_52%_60%)]" />
          <span className="line-clamp-1">
            {slide.address ? `${capitalizeFirst(slide.address)}, ` : ''}
            {slide.city}
          </span>
        </motion.p>

        {specs.length ? (
          <motion.ul variants={ITEM} className="mt-[2.8vh] flex flex-wrap gap-[2.4vw]">
            {specs.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-[0.7vw]">
                <div className="grid size-[3vw] place-items-center rounded-xl border border-white/15 bg-white/[0.08] backdrop-blur-sm">
                  <Icon className="size-[1.65vw] text-[hsl(38_52%_60%)]" strokeWidth={1.6} />
                </div>
                <div className="leading-tight">
                  <p className="text-[clamp(1.1rem,1.65vw,2.1rem)] font-semibold tabular-nums">
                    {value}
                  </p>
                  <p className="text-[clamp(0.62rem,0.8vw,1rem)] uppercase tracking-[0.18em] text-white/60">
                    {label}
                  </p>
                </div>
              </li>
            ))}
          </motion.ul>
        ) : null}

        <motion.div
          variants={ITEM}
          className="mt-[3.2vh] flex flex-wrap items-baseline gap-[1.5vw]"
        >
          <p className="font-display text-[clamp(2.4rem,4.4vw,5.4rem)] font-semibold tabular-nums leading-none text-[hsl(38_52%_60%)] drop-shadow-sm">
            {formatListingPrice(slide.price, slide.pricePeriod, 'es')}
          </p>
          {slide.hoaFee && slide.hoaFee > 0 ? (
            <span className="rounded-full border border-white/15 bg-black/40 px-[0.9vw] py-[0.35vh] text-[0.9vw] text-white/75 backdrop-blur">
              + ${formatNumber(slide.hoaFee)} alícuota
            </span>
          ) : null}
        </motion.div>
      </section>

      {/* Right column: Call to Action Card + QR Code + Brand Signature */}
      <motion.aside
        variants={ITEM}
        className="absolute bottom-[11.5vh] right-[4vw] w-[28vw] rounded-[1.3vw] border border-white/20 bg-black/60 p-[1.5vw] shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-[1vw]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[0.5vw]">
              <Image
                src="/images/logo-sarango-real.jpeg"
                alt=""
                width={40}
                height={40}
                className="size-[1.8vw] rounded-full ring-1 ring-[hsl(38_52%_60%/0.6)]"
              />
              <p className="truncate text-[0.82vw] font-semibold uppercase tracking-[0.22em] text-[hsl(38_52%_60%)]">
                Agenda tu visita
              </p>
            </div>

            <p className="mt-[1.1vh] flex items-center gap-[0.55vw] text-[clamp(1.1rem,1.75vw,2.2rem)] font-bold tabular-nums tracking-tight text-white">
              <Phone className="size-[1.45vw] shrink-0 text-[hsl(38_52%_60%)]" />
              <span className="truncate">{contact.phone}</span>
            </p>

            <p className="mt-[0.8vh] flex items-center gap-[0.5vw] text-[1vw] text-white/80">
              <Globe className="size-[1.05vw] shrink-0 text-[hsl(38_52%_60%)]" />
              <span className="truncate">{contact.site}</span>
            </p>

            <div className="mt-[1.4vh] flex items-center justify-between border-t border-white/15 pt-[1.1vh]">
              <span className="font-mono text-[0.85vw] text-white/60">
                Ref. <strong className="font-semibold text-white/90">{slide.reference}</strong>
              </span>
              <span className="text-[0.75vw] uppercase tracking-[0.16em] text-[hsl(38_52%_60%)]">
                Escanea el QR →
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-[0.4vh]">
            <div className="rounded-xl bg-white p-[0.35vw] shadow-lg ring-2 ring-[hsl(38_52%_60%/0.5)]">
              <QrCodeSvg value={qrUrl} className="size-[6.2vw] min-h-16 min-w-16" />
            </div>
            <span className="text-[0.65vw] font-medium uppercase tracking-[0.18em] text-white/65">
              WhatsApp / Info
            </span>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/**
 * Intercalated Promotional Slide (Owner Consignment / Buyer Advisory) designed for mall traffic.
 */
function PromoInterstitialSlide({
  promo,
  contact,
  qrUrl,
  isPortrait,
}: {
  promo: PromoCampaign;
  contact: PropertySlideshowProps['contact'];
  qrUrl: string;
  isPortrait: boolean;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.45 } },
      }}
      className={cn(
        'absolute z-10',
        isPortrait
          ? 'inset-x-5 bottom-14 top-20 flex flex-col justify-between gap-4'
          : 'inset-x-[4vw] bottom-[11.5vh] top-[14vh] grid grid-cols-12 items-center gap-[3vw]',
      )}
    >
      {/* Left / Upper Section: Campaign Message & Value Cards */}
      <div className={cn('flex flex-col justify-center', !isPortrait && 'col-span-7')}>
        <motion.div variants={ITEM} className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full bg-[hsl(38_52%_60%)] font-semibold uppercase tracking-[0.18em] text-[hsl(40_40%_10%)] shadow-md',
              isPortrait ? 'px-3 py-1 text-xs' : 'px-[1vw] py-[0.45vh] text-[0.88vw]',
            )}
          >
            <Megaphone className={isPortrait ? 'size-3.5' : 'size-[1vw]'} />
            {promo.badge}
          </span>
          <span
            className={cn(
              'rounded-full border border-white/15 bg-white/10 font-mono uppercase tracking-[0.18em] text-white/80 backdrop-blur',
              isPortrait ? 'px-3 py-1 text-[0.65rem]' : 'px-[0.9vw] py-[0.4vh] text-[0.8vw]',
            )}
          >
            {promo.eyebrow}
          </span>
        </motion.div>

        <motion.h1
          variants={ITEM}
          className={cn(
            'font-display font-semibold leading-[1.06] tracking-tight text-white',
            isPortrait
              ? 'mt-3 text-[clamp(1.55rem,3.8vmin,2.25rem)]'
              : 'mt-[2vh] text-[clamp(2rem,3.4vw,4.2rem)]',
          )}
        >
          {promo.title}
        </motion.h1>

        <motion.p
          variants={ITEM}
          className={cn(
            'text-white/80',
            isPortrait
              ? 'mt-2 text-[clamp(0.85rem,1.9vmin,1.05rem)] leading-snug'
              : 'mt-[1.6vh] max-w-[50vw] text-[clamp(1rem,1.3vw,1.65rem)] leading-relaxed',
          )}
        >
          {promo.subtitle}
        </motion.p>

        <motion.div
          variants={ITEM}
          className={cn(
            'grid gap-2.5',
            isPortrait ? 'mt-3.5 grid-cols-1' : 'mt-[3vh] grid-cols-3 gap-[1.2vw]',
          )}
        >
          {promo.highlights.map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className={cn(
                'rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md',
                isPortrait ? 'flex items-center gap-3 p-2.5' : 'p-[1.1vw]',
              )}
            >
              <div
                className={cn(
                  'grid shrink-0 place-items-center rounded-xl bg-[hsl(38_52%_60%/0.2)] text-[hsl(38_52%_65%)]',
                  isPortrait ? 'size-9' : 'mb-[1vh] size-[2.4vw]',
                )}
              >
                <Icon className={isPortrait ? 'size-5' : 'size-[1.3vw]'} />
              </div>
              <div>
                <h3
                  className={cn(
                    'font-semibold text-white',
                    isPortrait ? 'text-sm' : 'text-[1.05vw]',
                  )}
                >
                  {title}
                </h3>
                <p
                  className={cn(
                    'text-white/65',
                    isPortrait ? 'text-xs leading-tight' : 'mt-[0.4vh] text-[0.82vw] leading-snug',
                  )}
                >
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right / Lower Section: QR Action Card */}
      <motion.div
        variants={ITEM}
        className={cn(
          'tick-frame border border-white/20 bg-black/65 shadow-2xl backdrop-blur-xl',
          isPortrait
            ? 'flex items-center justify-between gap-4 rounded-2xl p-4'
            : 'col-span-5 flex flex-col items-center rounded-[1.6vw] p-[2.2vw] text-center',
        )}
      >
        <div className={cn(isPortrait ? 'min-w-0 flex-1' : 'flex flex-col items-center')}>
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-sarango-real.jpeg"
              alt={contact.name}
              width={48}
              height={48}
              className={cn(
                'rounded-full ring-2 ring-[hsl(38_52%_60%)]',
                isPortrait ? 'size-8' : 'size-[3.2vw]',
              )}
            />
            <span
              className={cn(
                'font-semibold uppercase tracking-[0.2em] text-[hsl(38_52%_60%)]',
                isPortrait ? 'text-[0.68rem]' : 'text-[0.85vw]',
              )}
            >
              Atención Inmediata
            </span>
          </div>

          <h2
            className={cn(
              'font-display font-semibold text-white',
              isPortrait ? 'mt-1.5 text-base' : 'mt-[1.2vh] text-[1.8vw]',
            )}
          >
            {promo.ctaLabel}
          </h2>

          <p
            className={cn(
              'mt-1.5 flex items-center gap-2 font-bold tabular-nums text-white',
              isPortrait ? 'text-lg' : 'mt-[1.4vh] justify-center text-[1.9vw]',
            )}
          >
            <Phone
              className={cn('text-[hsl(38_52%_60%)]', isPortrait ? 'size-4' : 'size-[1.5vw]')}
            />
            {contact.phone}
          </p>
          <p
            className={cn(
              'flex items-center gap-1.5 text-[hsl(38_52%_68%)]',
              isPortrait ? 'text-xs' : 'mt-[0.5vh] justify-center text-[1.05vw]',
            )}
          >
            <Globe className={isPortrait ? 'size-3.5' : 'size-[1.05vw]'} />
            {contact.site}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <div
            className={cn(
              'rounded-2xl bg-white shadow-2xl ring-4 ring-[hsl(38_52%_60%/0.55)]',
              isPortrait ? 'p-1.5' : 'my-[1.8vh] p-[0.65vw]',
            )}
          >
            <QrCodeSvg
              value={qrUrl}
              className={isPortrait ? 'size-24' : 'size-[10.5vw] min-h-24 min-w-24'}
            />
          </div>
          <span
            className={cn(
              'font-mono uppercase tracking-[0.18em] text-white/65',
              isPortrait ? 'text-[0.6rem]' : 'text-[0.75vw]',
            )}
          >
            Escanea para WhatsApp
          </span>
        </div>
      </motion.div>
    </motion.section>
  );
}

/**
 * Smart title component for digital signage:
 * - Short titles render cleanly without movement.
 * - Long titles (> 24 characters or overflowing the container width) smoothly
 *   slide backward (right-to-left marquee) so passersby can read 100% of the
 *   text without `...` truncation.
 */
function ScrollingTitle({
  title,
  paused,
  intervalMs,
  isPortrait = false,
}: {
  title: string;
  paused: boolean;
  intervalMs: number;
  isPortrait?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = React.useState(title.length > 24);

  React.useLayoutEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const measure = measureRef.current;
      if (!container || !measure) return;
      const isOverflowing = measure.scrollWidth > container.clientWidth + 4;
      setShouldScroll(isOverflowing || title.length > (isPortrait ? 22 : 28));
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title, isPortrait]);

  const durationSeconds = React.useMemo(() => {
    const byChars = Math.max(8, title.length * 0.16);
    const maxBySlide = Math.max(7.5, (intervalMs / 1000) * 0.88);
    return Math.min(byChars, maxBySlide);
  }, [title, intervalMs]);

  const textSizeClass = isPortrait
    ? 'text-[clamp(1.45rem,3.6vmin,2.2rem)]'
    : 'text-[clamp(1.8rem,3.5vw,4.3rem)]';

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <span
        ref={measureRef}
        aria-hidden
        className={cn(
          'pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap font-display font-semibold leading-[1.08] tracking-[-0.02em]',
          textSizeClass,
        )}
      >
        {title}
      </span>

      {shouldScroll ? (
        <div className="mask-fade-x overflow-hidden py-[0.2vh]">
          <h1
            aria-label={title}
            className={cn(
              'slideshow-marquee-track font-display font-semibold leading-[1.08] tracking-[-0.02em] text-white',
              textSizeClass,
            )}
            style={
              {
                '--marquee-duration': `${durationSeconds.toFixed(1)}s`,
                animationPlayState: paused ? 'paused' : 'running',
              } as React.CSSProperties
            }
          >
            <span className="whitespace-nowrap pr-10">{title}</span>
            <span
              aria-hidden
              className="inline-flex items-center whitespace-nowrap pr-10 text-[hsl(38_52%_60%)]"
            >
              ✦
            </span>
            <span aria-hidden className="whitespace-nowrap pr-10">
              {title}
            </span>
            <span
              aria-hidden
              className="inline-flex items-center whitespace-nowrap pr-10 text-[hsl(38_52%_60%)]"
            >
              ✦
            </span>
          </h1>
        </div>
      ) : (
        <h1
          className={cn(
            'font-display font-semibold leading-[1.06] tracking-[-0.02em] text-white',
            textSizeClass,
          )}
        >
          {title}
        </h1>
      )}
    </div>
  );
}

/**
 * Dedicated full-screen Brand Outro Slide displayed at the end of all publications.
 * Adapts automatically between 16:9 TV and 9:16 Vertical Totem.
 */
function BrandOutroSlide({
  contact,
  qrUrl,
  propertyCount,
  isPortrait,
}: {
  contact: PropertySlideshowProps['contact'];
  qrUrl: string;
  propertyCount: number;
  isPortrait: boolean;
}) {
  const pillars = [
    { icon: Building2, label: 'Compra, Venta y Alquiler Residencial y Comercial' },
    { icon: ShieldCheck, label: 'Propiedades Auditadas · Planos y Documentación Verificada' },
    { icon: CheckCircle2, label: 'Asesoría Legal, Financiamiento y Gestión Integral' },
  ];

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.45 } },
      }}
      className={cn(
        'absolute z-10',
        isPortrait
          ? 'inset-x-5 bottom-14 top-20 flex flex-col justify-between gap-4'
          : 'inset-x-[4vw] bottom-[11.5vh] top-[14vh] grid grid-cols-12 items-center gap-[3vw]',
      )}
    >
      <div className={cn('flex flex-col justify-center', !isPortrait && 'col-span-7')}>
        <motion.div
          variants={ITEM}
          className={cn('flex items-center', isPortrait ? 'gap-4' : 'gap-[1.8vw]')}
        >
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-full bg-[hsl(38_52%_60%/0.25)] blur-xl" />
            <Image
              src="/images/logo-sarango-real.jpeg"
              alt={contact.name}
              width={200}
              height={200}
              className={cn(
                'relative rounded-full object-cover shadow-2xl ring-4 ring-[hsl(38_52%_60%)]',
                isPortrait ? 'size-20' : 'size-[8.8vw] min-h-24 min-w-24',
              )}
            />
          </div>
          <div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-[hsl(38_52%_60%/0.4)] bg-[hsl(38_52%_60%/0.15)] font-semibold uppercase tracking-[0.2em] text-[hsl(38_52%_70%)]',
                isPortrait ? 'px-2.5 py-0.5 text-[0.65rem]' : 'px-[1vw] py-[0.4vh] text-[0.85vw]',
              )}
            >
              <Sparkles className={isPortrait ? 'size-3' : 'size-[0.95vw]'} />
              Agencia Inmobiliaria Boutique
            </span>
            <h1
              className={cn(
                'mt-1.5 font-display font-semibold leading-[1.02] tracking-tight text-white',
                isPortrait
                  ? 'text-[clamp(1.65rem,4vmin,2.4rem)]'
                  : 'text-[clamp(2.2rem,4.2vw,5rem)]',
              )}
            >
              {contact.name}
            </h1>
          </div>
        </motion.div>

        <motion.p
          variants={ITEM}
          className={cn(
            'font-display italic text-[hsl(38_52%_68%)]',
            isPortrait
              ? 'mt-3 text-[clamp(1rem,2.2vmin,1.3rem)]'
              : 'mt-[2.4vh] max-w-[50vw] text-[clamp(1.2rem,2vw,2.4rem)]',
          )}
        >
          “{contact.tagline ?? 'Encuentra tu espacio, sin sorpresas ocultas.'}”
        </motion.p>

        <motion.ul
          variants={ITEM}
          className={cn(isPortrait ? 'mt-3 space-y-2' : 'mt-[3vh] space-y-[1.4vh]')}
        >
          {pillars.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className={cn(
                'flex items-center text-white/90',
                isPortrait ? 'gap-2.5 text-xs' : 'gap-[0.9vw] text-[clamp(0.95rem,1.25vw,1.5rem)]',
              )}
            >
              <span
                className={cn(
                  'grid shrink-0 place-items-center rounded-lg border border-[hsl(38_52%_60%/0.35)] bg-[hsl(38_52%_60%/0.15)] text-[hsl(38_52%_60%)]',
                  isPortrait ? 'size-7' : 'size-[2.4vw]',
                )}
              >
                <Icon className={isPortrait ? 'size-4' : 'size-[1.3vw]'} />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </motion.ul>

        <motion.div
          variants={ITEM}
          className={cn(
            'flex flex-wrap items-center border-t border-white/15 text-white/75',
            isPortrait
              ? 'mt-3 gap-2 pt-2.5 text-xs'
              : 'mt-[3.2vh] gap-[2vw] pt-[2.2vh] text-[1.05vw]',
          )}
        >
          {contact.officeAddress ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-[hsl(38_52%_60%)]" />
              {contact.officeAddress}
            </span>
          ) : null}
          {contact.hours ? (
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-4 shrink-0 text-[hsl(38_52%_60%)]" />
              {contact.hours}
            </span>
          ) : null}
        </motion.div>
      </div>

      {/* Right / Bottom QR Action Card */}
      <motion.div
        variants={ITEM}
        className={cn(
          'tick-frame border border-white/20 bg-black/65 shadow-2xl backdrop-blur-xl',
          isPortrait
            ? 'flex items-center justify-between gap-4 rounded-2xl p-4'
            : 'col-span-5 flex flex-col items-center rounded-[1.6vw] p-[2.4vw] text-center',
        )}
      >
        <div className={cn(isPortrait ? 'min-w-0 flex-1' : 'flex flex-col items-center')}>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.22em] text-[hsl(38_52%_60%)]',
              isPortrait ? 'text-[0.65rem]' : 'text-[0.9vw]',
            )}
          >
            <QrCode className={isPortrait ? 'size-3.5' : 'size-[1.1vw]'} />
            Catálogo Digital y WhatsApp
          </span>

          <h2
            className={cn(
              'font-display font-semibold text-white',
              isPortrait ? 'mt-1 text-lg' : 'mt-[0.8vh] text-[2.1vw]',
            )}
          >
            Escanea con tu celular
          </h2>
          <p
            className={cn(
              'text-white/65',
              isPortrait ? 'mt-0.5 text-xs' : 'mt-[0.4vh] text-[0.95vw]',
            )}
          >
            {propertyCount > 0
              ? 'Explora nuestras propiedades o conversa con un asesor ahora mismo'
              : 'Contáctanos por WhatsApp o visita nuestro catálogo en línea'}
          </p>

          <div
            className={cn(
              'w-full',
              isPortrait
                ? 'mt-2.5 space-y-1 border-t border-white/15 pt-2'
                : 'mt-[1.8vh] space-y-[0.8vh]',
            )}
          >
            <p
              className={cn(
                'flex items-center gap-2 font-bold tabular-nums text-white',
                isPortrait ? 'text-lg' : 'justify-center text-[2vw]',
              )}
            >
              <Phone
                className={cn('text-[hsl(38_52%_60%)]', isPortrait ? 'size-4' : 'size-[1.6vw]')}
              />
              {contact.phone}
            </p>
            <p
              className={cn(
                'flex items-center gap-1.5 text-[hsl(38_52%_68%)]',
                isPortrait ? 'text-xs' : 'justify-center text-[1.15vw]',
              )}
            >
              <Globe className={isPortrait ? 'size-3.5' : 'size-[1.15vw]'} />
              {contact.site}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'shrink-0 rounded-2xl bg-white shadow-2xl ring-4 ring-[hsl(38_52%_60%/0.55)]',
            isPortrait ? 'p-1.5' : 'my-[2vh] p-[0.7vw]',
          )}
        >
          <QrCodeSvg
            value={qrUrl}
            className={isPortrait ? 'size-24' : 'size-[11.5vw] min-h-28 min-w-28'}
          />
        </div>
      </motion.div>
    </motion.section>
  );
}

/**
 * Live Weather & Temperature widget for the top bar.
 */
function WeatherWidget({
  city,
  coordinates,
  initialWeather,
  compact = false,
}: {
  city: string;
  coordinates: { lat: number; lng: number };
  initialWeather: SlideshowWeather | null;
  compact?: boolean;
}) {
  const [weather, setWeather] = React.useState<SlideshowWeather | null>(initialWeather);
  const [fallbackWeather, setFallbackWeather] = React.useState<SlideshowWeather | null>(null);

  React.useEffect(() => {
    let active = true;

    const updateFallback = () => {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 19;
      const tempByHour = [
        11, 10, 10, 9, 9, 10, 11, 13, 15, 17, 18, 19, 20, 20, 20, 19, 18, 16, 15, 14, 13, 12, 12,
        11,
      ];
      setFallbackWeather({
        tempC: tempByHour[hour] ?? 18,
        weatherCode: isDay ? 1 : 0,
        isDay,
      });
    };

    const fetchLiveWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lng}&current=temperature_2m,weather_code,is_day&timezone=America%2FGuayaquil`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
        };
        if (active && typeof data.current?.temperature_2m === 'number') {
          setWeather({
            tempC: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code ?? 1,
            isDay: (data.current.is_day ?? 1) === 1,
          });
        }
      } catch {
        // Keep last known weather or fallback curve when offline
      }
    };

    updateFallback();
    void fetchLiveWeather();
    const id = window.setInterval(() => {
      updateFallback();
      void fetchLiveWeather();
    }, WEATHER_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [coordinates.lat, coordinates.lng]);

  const current = weather ?? fallbackWeather;
  if (!current) return null;

  const { Icon, label } = describeWeather(current.weatherCode, current.isDay);

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'grid place-items-center rounded-xl bg-[hsl(38_52%_60%/0.18)] text-[hsl(38_52%_65%)]',
          compact ? 'size-8' : 'size-[2.6vw] min-h-8 min-w-8',
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-[1.5vw]'} />
      </div>
      <div className="leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'font-mono font-bold tabular-nums text-white',
              compact ? 'text-sm' : 'text-[clamp(1rem,1.45vw,1.8rem)]',
            )}
          >
            {current.tempC}°C
          </span>
          <span
            className={cn(
              'font-semibold uppercase tracking-[0.14em] text-[hsl(38_52%_65%)]',
              compact ? 'text-[0.6rem]' : 'text-[clamp(0.6rem,0.8vw,1rem)]',
            )}
          >
            {city}
          </span>
        </div>
        <p
          className={cn(
            'text-white/65',
            compact ? 'text-[0.62rem]' : 'text-[clamp(0.58rem,0.75vw,0.95rem)]',
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function describeWeather(code: number, isDay: boolean) {
  if (code === 0) {
    return { Icon: isDay ? Sun : Moon, label: isDay ? 'Despejado' : 'Noche despejada' };
  }
  if (code === 1 || code === 2) {
    return { Icon: isDay ? CloudSun : CloudMoon, label: 'Parcialmente nublado' };
  }
  if (code === 3) {
    return { Icon: Cloud, label: 'Nublado' };
  }
  if (code >= 45 && code <= 48) {
    return { Icon: CloudFog, label: 'Neblina' };
  }
  if (code >= 51 && code <= 57) {
    return { Icon: CloudDrizzle, label: 'Llovizna' };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { Icon: CloudRain, label: 'Lluvia' };
  }
  if (code >= 95) {
    return { Icon: CloudLightning, label: 'Tormenta' };
  }
  return { Icon: isDay ? CloudSun : CloudMoon, label: 'Clima templado' };
}

/** Rendered client-only to avoid a server/client time mismatch on hydration. */
function ClockWidget({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 10_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;

  const timeStr = now.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex items-center gap-2">
      <Clock3 className={cn('text-[hsl(38_52%_60%)]', compact ? 'size-4' : 'size-[1.4vw]')} />
      <div className="leading-tight">
        <p
          className={cn(
            'font-mono font-bold tabular-nums text-white',
            compact ? 'text-sm' : 'text-[clamp(0.95rem,1.35vw,1.7rem)]',
          )}
        >
          {timeStr}
        </p>
        <p
          className={cn(
            'capitalize tracking-[0.12em] text-white/65',
            compact ? 'text-[0.62rem]' : 'text-[clamp(0.58rem,0.75vw,0.95rem)]',
          )}
        >
          {dateStr}
        </p>
      </div>
    </div>
  );
}

const ITEM = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const KEN_BURNS_ORIGINS = ['center center', 'left top', 'right bottom', 'right top', 'left bottom'];

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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

function Pill({
  className,
  isPortrait = false,
  children,
}: {
  className?: string;
  isPortrait?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'rounded-full font-semibold uppercase tracking-[0.16em]',
        isPortrait ? 'px-2.5 py-0.5 text-[0.65rem]' : 'px-[1vw] py-[0.45vh] text-[0.88vw]',
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
