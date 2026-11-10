'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ExternalLink,
  FileCheck2,
  Globe,
  Handshake,
  KeyRound,
  MapPin,
  Maximize,
  Megaphone,
  MessageCircle,
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

export interface SlideshowContact {
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
}

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
  contact: SlideshowContact;
}

const TICK_MS = 200;
const FADE_S = 1.2;
/** Re-fetch the listing set so a screen left on for days shows new publications. */
const REFRESH_MS = 10 * 60 * 1000;
const WEATHER_REFRESH_MS = 15 * 60 * 1000;
const CONTROLS_IDLE_MS = 3500;
const PROMO_INTERVAL_COUNT = 3;

const PROMO_CAMPAIGNS: PromoCampaign[] = [
  {
    id: 'promo-captacion',
    eyebrow: 'Captación de Propietarios · Cuenca',
    badge: '¿Deseas vender o alquilar?',
    title: 'Vendemos o alquilamos tu propiedad sin sorpresas ocultas',
    subtitle:
      'Medimos cada plano, producimos fotografía profesional, exhibimos tu inmueble en puntos estratégicos y filtramos compradores reales.',
    ctaLabel: 'Consigna tu propiedad por WhatsApp',
    whatsappText:
      'Hola Sarango Real Estate, deseo información para vender o alquilar mi propiedad.',
    backgroundImage: '/images/sarango-office.jpg',
    highlights: [
      {
        icon: FileCheck2,
        title: 'Auditoría y Avalúo Real',
        detail: 'Planos medidos, revisión documental y precio competitivo de mercado.',
      },
      {
        icon: TrendingUp,
        title: 'Máxima Exposición Comercial',
        detail: 'Presencia en pantallas digitales, portal web y redes sociales.',
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
    whatsappText: 'Hola Sarango Real Estate, busco asesoría para comprar o alquilar una propiedad.',
    backgroundImage: '/images/sarango-meeting-room.jpg',
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

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
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
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  // Signal to the page watchdog that React hydrated and mounted cleanly.
  React.useEffect(() => {
    try {
      (window as unknown as { __TV_REACT_HYDRATED__?: boolean }).__TV_REACT_HYDRATED__ = true;
    } catch {
      // ignore
    }
  }, []);

  // Detect physical portrait orientation (9:16 totems) and mobile phone screens (< 768px).
  React.useEffect(() => {
    const checkViewport = () => {
      try {
        const w = window.innerWidth || document.documentElement.clientWidth || 1920;
        const h = window.innerHeight || document.documentElement.clientHeight || 1080;
        setViewportPortrait(h > w);
        setIsMobileDevice(w > 0 && w < 768);
      } catch {
        // ignore
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const isPortrait =
    formatMode === 'portrait' || (formatMode === 'auto' && (viewportPortrait || isMobileDevice));
  const isSimulatedPortrait = formatMode === 'portrait' && !viewportPortrait && !isMobileDevice;
  const isMobile = isMobileDevice && !isSimulatedPortrait;

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
    let last = nowMs();
    const id = window.setInterval(() => {
      const now = nowMs();
      dispatch({ type: 'tick', delta: Math.max(0, now - last), totalSlides, intervalMs });
      last = now;
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [paused, totalSlides, intervalMs]);

  // Pull fresh listings periodically (page is force-dynamic).
  React.useEffect(() => {
    const id = window.setInterval(() => {
      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [router]);

  // Keep TVs / monitors from dimming or sleeping while the show runs.
  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        // Not allowed — retried on visibility change.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      try {
        void sentinel?.release();
      } catch {
        // ignore
      }
    };
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    try {
      if (document.fullscreenElement) {
        void document.exitFullscreen?.();
      } else {
        void rootRef.current?.requestFullscreen?.();
      }
    } catch {
      // ignore on TV browsers without Fullscreen API
    }
  }, []);

  React.useEffect(() => {
    const onChange = () => {
      try {
        setIsFullscreen(Boolean(document.fullscreenElement));
      } catch {
        // ignore
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Keyboard / TV-remote control (supports both modern event.key and legacy event.keyCode).
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      const code = event.keyCode;
      if (key === 'ArrowRight' || code === 39) {
        go(index + 1);
      } else if (key === 'ArrowLeft' || code === 37) {
        go(index - 1);
      } else if (
        key === ' ' ||
        key === 'Enter' ||
        key === 'MediaPlayPause' ||
        code === 13 ||
        code === 32 ||
        code === 179
      ) {
        event.preventDefault();
        setPaused((value) => !value);
      } else if (key === 'f' || key === 'F' || code === 70) {
        toggleFullscreen();
      } else if (key === 'v' || key === 'V' || code === 86) {
        cycleFormatMode();
      } else {
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
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, me interesa la propiedad Ref. ${slide.reference}`)}`
        : `${contact.url || `https://${contact.site}`}/properties/${slide.slug}`;
    }
    if (promo) {
      return whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(promo.whatsappText)}`
        : contact.url || `https://${contact.site}`;
    }
    return whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hola Sarango Real Estate, deseo recibir información sobre sus propiedades disponibles.')}`
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

  const handleTouchStart = React.useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setControlsVisible(true);
  }, []);

  const handleTouchEnd = React.useCallback(
    (event: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      const touch = event.changedTouches[0];
      if (!start || !touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        if (dx < 0) go(index + 1);
        else go(index - 1);
      }
    },
    [go, index],
  );

  return (
    <div
      ref={rootRef}
      data-tv-slideshow-mounted="1"
      onMouseMove={() => setControlsVisible(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={toggleFullscreen}
      className={cn(
        'fixed inset-0 touch-pan-y select-none overflow-hidden bg-[#050807] text-white',
        !controlsVisible && !isMobile && 'cursor-none',
        isSimulatedPortrait && 'grid place-items-center',
      )}
    >
      {isSimulatedPortrait ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(38_52%_60%/0.14),transparent_70%)]"
        />
      ) : null}

      <div
        className={cn(
          'relative overflow-hidden bg-[#0A0F0D]',
          isSimulatedPortrait
            ? 'aspect-[9/16] h-[96dvh] h-[96vh] max-w-[96dvw] max-w-[96vw] rounded-[2rem] border border-white/20 shadow-[0_0_90px_rgba(0,0,0,0.9)]'
            : 'h-dvh h-screen w-dvw w-screen',
        )}
      >
        {/* ── Background Layer (Pure CSS transitions for universal Smart TV support) ── */}
        {currentItem.kind === 'brand' ? (
          <div
            key="brand-outro-bg"
            className="slideshow-bg-fade absolute inset-0 overflow-hidden bg-gradient-to-br from-[#070B0A] via-[#0E1915] to-[#080D0B]"
          >
            {properties[0]?.images[0] && !failedUrls[properties[0].images[0]] ? (
              <div className="absolute inset-0 opacity-15">
                <SlideshowImg
                  src={properties[0].images[0]}
                  alt=""
                  className="h-full w-full scale-105 object-cover blur-sm"
                />
              </div>
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_45%,rgba(206,158,81,0.18),transparent_62%),radial-gradient(circle_at_80%_20%,rgba(82,183,165,0.14),transparent_55%)]" />
          </div>
        ) : currentItem.kind === 'promo' && promo ? (
          <div
            key={currentItem.key}
            className="slideshow-bg-fade absolute inset-0 overflow-hidden bg-[#09110E]"
          >
            <div
              className="absolute inset-0 opacity-30 will-change-transform"
              style={{
                animation: `slideshow-kenburns ${intervalMs + FADE_S * 1000}ms ease-out forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
            >
              <SlideshowImg
                src={promo.backgroundImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#070D0B]/95 via-[#0E1B16]/85 to-[#070D0B]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(206,158,81,0.2),transparent_60%)]" />
          </div>
        ) : (
          <div
            key={`${slide?.id}-${currentImageSrc || imageIndex}`}
            className={cn(
              'slideshow-bg-fade absolute inset-x-0 top-0',
              isPortrait ? 'h-[52%]' : 'inset-0',
            )}
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
                <SlideshowImg
                  src={currentImageSrc}
                  alt={slide?.title ?? contact.name}
                  className="h-full w-full object-cover"
                  onError={() => markImageFailed(currentImageSrc)}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0F0D] via-[#121C18] to-[#0A0F0D]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-sarango-real.jpeg"
                  alt={contact.name}
                  width={220}
                  height={220}
                  className="rounded-full opacity-20 ring-1 ring-white/15"
                />
              </div>
            )}
          </div>
        )}

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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${i}-${src}`}
                src={src}
                alt=""
                className="h-full w-full object-cover"
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

        {/* ── Top Bar: Brand Identity + Live Info (Weather, Time, Slide) ── */}
        <header
          className={cn(
            'absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2',
            isMobile
              ? 'px-3.5 pt-[max(0.75rem,env(safe-area-inset-top))]'
              : isPortrait
                ? 'px-5 pt-4'
                : 'px-[4vw] pt-[2.8vh]',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-sarango-real.jpeg"
              alt={contact.name}
              width={96}
              height={96}
              className={cn(
                'shrink-0 rounded-full object-cover shadow-lg ring-2 ring-[#CE9E51]/65',
                isMobile
                  ? 'h-9 w-9'
                  : isPortrait
                    ? 'h-11 w-11'
                    : 'h-[4.2vw] min-h-11 w-[4.2vw] min-w-11',
              )}
            />
            <div className="min-w-0 leading-tight">
              <p
                className={cn(
                  'truncate font-display font-semibold tracking-tight text-white drop-shadow',
                  isMobile ? 'text-sm' : isPortrait ? 'text-lg' : 'text-[1.75vw]',
                )}
              >
                {contact.name}
              </p>
              <p
                className={cn(
                  'truncate font-medium uppercase tracking-[0.2em] text-[#CE9E51]',
                  isMobile ? 'text-[0.55rem]' : isPortrait ? 'text-[0.65rem]' : 'text-[0.85vw]',
                )}
              >
                {isMobile
                  ? (contact.officeCity ?? 'Cuenca')
                  : `Bienes raíces · ${contact.officeCity ?? 'Cuenca'}`}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex shrink-0 items-center rounded-2xl border border-white/15 bg-black/65 shadow-2xl backdrop-blur-md',
              isMobile
                ? 'gap-2 px-2.5 py-1'
                : isPortrait
                  ? 'gap-2.5 px-3 py-1.5'
                  : 'gap-[1.4vw] px-[1.5vw] py-[1vh]',
            )}
          >
            <WeatherWidget
              city={contact.officeCity ?? 'Cuenca'}
              coordinates={contact.coordinates ?? { lat: -2.9001, lng: -79.0059 }}
              initialWeather={initialWeather}
              compact={isPortrait}
              ultraCompact={isMobile}
            />
            <span className={cn('w-px bg-white/15', isMobile ? 'h-4' : 'h-6')} aria-hidden />
            <ClockWidget compact={isPortrait} ultraCompact={isMobile} />
            <span className={cn('w-px bg-white/15', isMobile ? 'h-4' : 'h-6')} aria-hidden />
            <div className="flex flex-col items-end leading-tight">
              {!isMobile ? (
                <span
                  className={cn(
                    'font-semibold uppercase tracking-[0.2em] text-white/50',
                    isPortrait ? 'text-[0.55rem]' : 'text-[0.68vw]',
                  )}
                >
                  {kindLabel}
                </span>
              ) : null}
              <span
                className={cn(
                  'font-mono font-semibold tabular-nums text-white',
                  isMobile ? 'text-[0.7rem]' : isPortrait ? 'text-xs' : 'text-[1.2vw]',
                )}
              >
                {String(index + 1).padStart(2, '0')}
                <span className="text-white/40">/{String(totalSlides).padStart(2, '0')}</span>
              </span>
            </div>
          </div>
        </header>

        {/* ── Main Content Stage ────────────────────────────────────── */}
        {currentItem.kind === 'brand' ? (
          <BrandOutroSlide
            key="brand-outro-content"
            contact={contact}
            qrUrl={qrUrl}
            propertyCount={properties.length}
            isPortrait={isPortrait}
            isMobile={isMobile}
          />
        ) : currentItem.kind === 'promo' && promo ? (
          <PromoInterstitialSlide
            key={currentItem.key}
            promo={promo}
            contact={contact}
            qrUrl={qrUrl}
            isPortrait={isPortrait}
            isMobile={isMobile}
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
            isMobile={isMobile}
          />
        ) : null}

        {/* ── Footer: Photo Progress + Next Slide Preview + Brand Seal ── */}
        <footer
          className={cn(
            'absolute inset-x-0 bottom-0 z-10',
            isMobile
              ? 'px-3.5 pb-[max(0.65rem,env(safe-area-inset-bottom))]'
              : isPortrait
                ? 'px-5 pb-3.5'
                : 'px-[4vw] pb-[3.2vh]',
          )}
        >
          <div
            className={cn(
              'mb-2 flex items-center justify-between gap-3 text-white/70',
              isPortrait ? 'text-xs' : 'text-[0.92vw]',
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
                          i === imageIndex ? 'w-6 bg-[#CE9E51]' : 'w-3 bg-white/25',
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[0.85em] tabular-nums text-white/55">
                    Foto {imageIndex + 1}/{imageCount}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.85em] uppercase tracking-[0.18em] text-[#CE9E51]">
                  <Sparkles className="h-3.5 w-3.5" />
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-sarango-real.jpeg"
                  alt=""
                  width={24}
                  height={24}
                  className="h-4 w-4 rounded-full"
                />
                <span className="font-display text-[0.85em] font-medium text-white/90">
                  {contact.name}
                </span>
              </div>
            </div>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full origin-left bg-[#CE9E51]"
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
          <ChevronLeft className="h-5 w-5" />
        </ControlButton>
        <ControlButton
          label={paused ? 'Reproducir' : 'Pausar'}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </ControlButton>
        <ControlButton label="Siguiente" onClick={() => go(index + 1)}>
          <ChevronRight className="h-5 w-5" />
        </ControlButton>
        <ControlButton
          label={
            isPortrait
              ? 'Cambiar a modo TV Horizontal (16:9)'
              : 'Cambiar a modo Tótem Vertical (9:16)'
          }
          onClick={cycleFormatMode}
        >
          {isPortrait ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
        </ControlButton>
        <ControlButton
          label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </ControlButton>
      </div>

      {paused ? (
        <div className="absolute right-6 top-20 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-4 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-md">
          <Pause className="h-4 w-4 text-[#CE9E51]" /> En pausa
        </div>
      ) : null}
    </div>
  );
}

/**
 * Native <img> wrapper with automatic brand fallback so Smart TVs never fail
 * on /_next/image AVIF/WebP negotiation or IntersectionObserver lazy loading.
 */
function SlideshowImg({
  src,
  alt,
  className,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  const [failed, setFailed] = React.useState(false);
  const effectiveSrc = !src || failed ? '/images/logo-sarango-real.jpeg' : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveSrc}
      alt={alt}
      className={cn(failed ? 'bg-[#0A0F0D] object-contain p-12' : 'object-cover', className)}
      onError={() => {
        if (!failed) {
          setFailed(true);
          onError?.();
        }
      }}
    />
  );
}

/**
 * Property listing slide view that adapts between 16:9 Horizontal TV, 9:16 Vertical Totem, and Mobile.
 */
function PropertySlideView({
  slide,
  specs,
  contact,
  qrUrl,
  paused,
  intervalMs,
  isPortrait,
  isMobile,
}: {
  slide: SlideshowProperty;
  specs: ReturnType<typeof buildSpecs>;
  contact: PropertySlideshowProps['contact'];
  qrUrl: string;
  paused: boolean;
  intervalMs: number;
  isPortrait: boolean;
  isMobile: boolean;
}) {
  if (isPortrait) {
    return (
      <div
        className={cn(
          'slideshow-content-enter absolute z-10 flex flex-col justify-between',
          isMobile ? 'inset-x-3.5 bottom-12 top-[39%]' : 'inset-x-5 bottom-14 top-[42%]',
        )}
      >
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Pill isPortrait className="bg-[#CE9E51] text-[#2B2110]">
              {getStatusLabel(slide.status, 'es')}
            </Pill>
            <Pill isPortrait className="border border-white/15 bg-white/15 backdrop-blur-md">
              {getTypeLabel(slide.type, 'es')}
            </Pill>
            {slide.featured ? (
              <Pill
                isPortrait
                className="border border-[#CE9E51]/40 bg-[#CE9E51]/20 text-[#E5C185]"
              >
                ★ Destacada
              </Pill>
            ) : null}
            {slide.utilitiesIncluded ? (
              <Pill isPortrait className="border border-white/15 bg-white/10 text-white/90">
                Servicios incl.
              </Pill>
            ) : null}
          </div>

          <div>
            <ScrollingTitle
              title={slide.title}
              paused={paused}
              intervalMs={intervalMs}
              isPortrait
            />
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-base font-medium text-white/85">
            <MapPin className="h-4 w-4 shrink-0 text-[#CE9E51]" />
            <span className="line-clamp-1">
              {slide.address ? `${capitalizeFirst(slide.address)}, ` : ''}
              {slide.city}
            </span>
          </p>

          {specs.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {specs.slice(0, 3).map(({ icon: Icon, value, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-1.5"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#CE9E51]" strokeWidth={1.6} />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-bold tabular-nums">{value}</p>
                    <p className="truncate text-[0.58rem] uppercase tracking-[0.12em] text-white/60">
                      {label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex items-baseline justify-between">
            <p className="font-display text-3xl font-semibold tabular-nums leading-none text-[#CE9E51]">
              {formatListingPrice(slide.price, slide.pricePeriod, 'es')}
            </p>
            <span className="font-mono text-xs text-white/55">Ref. {slide.reference}</span>
          </div>
        </div>

        {/* Bottom CTA: Direct Touch Buttons on Mobile Phone vs QR Code on Digital Totem */}
        {isMobile ? (
          <aside className="rounded-2xl border border-white/20 bg-black/75 p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-sarango-real.jpeg"
                  alt=""
                  width={28}
                  height={28}
                  className="h-6 w-6 rounded-full ring-1 ring-[#CE9E51]/60"
                />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#CE9E51]">
                  Agenda tu visita
                </span>
              </div>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 text-xs font-semibold tabular-nums text-white/90"
              >
                <Phone className="h-3.5 w-3.5 text-[#CE9E51]" />
                {contact.phone}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#CE9E51] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2B2110] shadow-md active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Link
                href={`/properties/${slide.slug}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white active:scale-[0.98]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#CE9E51]" />
                Ver ficha
              </Link>
            </div>
          </aside>
        ) : (
          <aside className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-black/70 p-3.5 shadow-2xl backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-sarango-real.jpeg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-6 w-6 rounded-full ring-1 ring-[#CE9E51]/60"
                />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#CE9E51]">
                  Agenda tu visita hoy
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-2 text-xl font-bold tabular-nums text-white">
                <Phone className="h-4 w-4 shrink-0 text-[#CE9E51]" />
                <span className="truncate">{contact.phone}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
                <Globe className="h-3.5 w-3.5 shrink-0 text-[#CE9E51]" />
                <span className="truncate">{contact.site}</span>
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="rounded-xl bg-white p-1.5 shadow-lg ring-2 ring-[#CE9E51]/55">
                <QrCodeSvg value={qrUrl} className="h-20 w-20" />
              </div>
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#CE9E51]">
                Escanea el QR
              </span>
            </div>
          </aside>
        )}
      </div>
    );
  }

  return (
    <div className="slideshow-content-enter">
      {/* Left column: Property details */}
      <section className="absolute bottom-[11.5vh] left-[4vw] w-[60vw] max-w-[60vw]">
        <div className="mb-[1.8vh] flex flex-wrap items-center gap-[0.6vw]">
          <Pill className="bg-[#CE9E51] text-[#2B2110] shadow-sm">
            {getStatusLabel(slide.status, 'es')}
          </Pill>
          <Pill className="border border-white/15 bg-white/15 backdrop-blur-md">
            {getTypeLabel(slide.type, 'es')}
          </Pill>
          {slide.featured ? (
            <Pill className="border border-[#CE9E51]/40 bg-[#CE9E51]/20 text-[#E5C185] backdrop-blur-md">
              ★ Destacada
            </Pill>
          ) : null}
          {slide.utilitiesIncluded ? (
            <Pill className="inline-flex items-center gap-[0.35vw] border border-white/15 bg-white/10 text-white/90 backdrop-blur-md">
              <Droplets className="h-[0.9vw] w-[0.9vw] text-[#CE9E51]" />
              Servicios incluidos
            </Pill>
          ) : null}
          {slide.petsAllowed ? (
            <Pill className="inline-flex items-center gap-[0.35vw] border border-white/15 bg-white/10 text-white/90 backdrop-blur-md">
              <PawPrint className="h-[0.9vw] w-[0.9vw] text-[#CE9E51]" />
              Pet friendly
            </Pill>
          ) : null}
        </div>

        <div>
          <ScrollingTitle title={slide.title} paused={paused} intervalMs={intervalMs} />
        </div>

        <p className="mt-[1.4vh] flex items-center gap-[0.55vw] text-[1.35vw] font-medium text-white/85">
          <MapPin className="h-[1.45vw] w-[1.45vw] shrink-0 text-[#CE9E51]" />
          <span className="line-clamp-1">
            {slide.address ? `${capitalizeFirst(slide.address)}, ` : ''}
            {slide.city}
          </span>
        </p>

        {specs.length ? (
          <ul className="mt-[2.8vh] flex flex-wrap gap-[2.4vw]">
            {specs.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-[0.7vw]">
                <div className="grid h-[3vw] w-[3vw] place-items-center rounded-xl border border-white/15 bg-white/[0.08] backdrop-blur-sm">
                  <Icon className="h-[1.65vw] w-[1.65vw] text-[#CE9E51]" strokeWidth={1.6} />
                </div>
                <div className="leading-tight">
                  <p className="text-[1.65vw] font-semibold tabular-nums">{value}</p>
                  <p className="text-[0.8vw] uppercase tracking-[0.18em] text-white/60">{label}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-[3.2vh] flex flex-wrap items-baseline gap-[1.5vw]">
          <p className="font-display text-[4.4vw] font-semibold tabular-nums leading-none text-[#CE9E51] drop-shadow-sm">
            {formatListingPrice(slide.price, slide.pricePeriod, 'es')}
          </p>
          {slide.hoaFee && slide.hoaFee > 0 ? (
            <span className="rounded-full border border-white/15 bg-black/40 px-[0.9vw] py-[0.35vh] text-[0.9vw] text-white/75 backdrop-blur">
              + ${formatNumber(slide.hoaFee)} alícuota
            </span>
          ) : null}
        </div>
      </section>

      {/* Right column: Call to Action Card + QR Code + Brand Signature */}
      <aside className="absolute bottom-[11.5vh] right-[4vw] w-[28vw] rounded-[1.3vw] border border-white/20 bg-black/65 p-[1.5vw] shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-[1vw]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[0.5vw]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-sarango-real.jpeg"
                alt=""
                width={40}
                height={40}
                className="h-[1.8vw] w-[1.8vw] rounded-full ring-1 ring-[#CE9E51]/60"
              />
              <p className="truncate text-[0.82vw] font-semibold uppercase tracking-[0.22em] text-[#CE9E51]">
                Agenda tu visita
              </p>
            </div>

            <p className="mt-[1.1vh] flex items-center gap-[0.55vw] text-[1.75vw] font-bold tabular-nums tracking-tight text-white">
              <Phone className="h-[1.45vw] w-[1.45vw] shrink-0 text-[#CE9E51]" />
              <span className="truncate">{contact.phone}</span>
            </p>

            <p className="mt-[0.8vh] flex items-center gap-[0.5vw] text-[1vw] text-white/80">
              <Globe className="h-[1.05vw] w-[1.05vw] shrink-0 text-[#CE9E51]" />
              <span className="truncate">{contact.site}</span>
            </p>

            <div className="mt-[1.4vh] flex items-center justify-between border-t border-white/15 pt-[1.1vh]">
              <span className="font-mono text-[0.85vw] text-white/60">
                Ref. <strong className="font-semibold text-white/90">{slide.reference}</strong>
              </span>
              <span className="text-[0.75vw] uppercase tracking-[0.16em] text-[#CE9E51]">
                Escanea el QR →
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-[0.4vh]">
            <div className="rounded-xl bg-white p-[0.35vw] shadow-lg ring-2 ring-[#CE9E51]/50">
              <QrCodeSvg value={qrUrl} className="h-[6.2vw] min-h-16 w-[6.2vw] min-w-16" />
            </div>
            <span className="text-[0.65vw] font-medium uppercase tracking-[0.18em] text-white/65">
              WhatsApp / Info
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

/**
 * Intercalated Promotional Slide (Owner Consignment / Buyer Advisory).
 */
function PromoInterstitialSlide({
  promo,
  contact,
  qrUrl,
  isPortrait,
  isMobile,
}: {
  promo: PromoCampaign;
  contact: PropertySlideshowProps['contact'];
  qrUrl: string;
  isPortrait: boolean;
  isMobile: boolean;
}) {
  return (
    <section
      className={cn(
        'slideshow-content-enter absolute z-10',
        isMobile
          ? 'inset-x-3.5 bottom-12 top-16 flex flex-col justify-between gap-3'
          : isPortrait
            ? 'inset-x-5 bottom-14 top-20 flex flex-col justify-between gap-4'
            : 'inset-x-[4vw] bottom-[11.5vh] top-[14vh] grid grid-cols-12 items-center gap-[3vw]',
      )}
    >
      {/* Left / Upper Section: Campaign Message & Value Cards */}
      <div className={cn('flex flex-col justify-center', !isPortrait && 'col-span-7')}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full bg-[#CE9E51] font-semibold uppercase tracking-[0.18em] text-[#2B2110] shadow-md',
              isPortrait ? 'px-3 py-1 text-xs' : 'px-[1vw] py-[0.45vh] text-[0.88vw]',
            )}
          >
            <Megaphone className={isPortrait ? 'h-3.5 w-3.5' : 'h-[1vw] w-[1vw]'} />
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
        </div>

        <h1
          className={cn(
            'font-display font-semibold leading-[1.06] tracking-tight text-white',
            isMobile ? 'mt-2.5 text-2xl' : isPortrait ? 'mt-3 text-3xl' : 'mt-[2vh] text-[3.4vw]',
          )}
        >
          {promo.title}
        </h1>

        <p
          className={cn(
            'text-white/80',
            isMobile
              ? 'mt-1.5 text-xs leading-snug'
              : isPortrait
                ? 'mt-2 text-sm leading-snug'
                : 'mt-[1.6vh] max-w-[50vw] text-[1.3vw] leading-relaxed',
          )}
        >
          {promo.subtitle}
        </p>

        <div
          className={cn(
            'grid gap-2',
            isPortrait ? 'mt-3 grid-cols-1' : 'mt-[3vh] grid-cols-3 gap-[1.2vw]',
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
                  'grid shrink-0 place-items-center rounded-xl bg-[#CE9E51]/20 text-[#CE9E51]',
                  isPortrait ? 'h-8 w-8' : 'mb-[1vh] h-[2.4vw] w-[2.4vw]',
                )}
              >
                <Icon className={isPortrait ? 'h-4 w-4' : 'h-[1.3vw] w-[1.3vw]'} />
              </div>
              <div>
                <h3
                  className={cn(
                    'font-semibold text-white',
                    isPortrait ? 'text-xs' : 'text-[1.05vw]',
                  )}
                >
                  {title}
                </h3>
                <p
                  className={cn(
                    'text-white/65',
                    isPortrait
                      ? 'text-[0.7rem] leading-tight'
                      : 'mt-[0.4vh] text-[0.82vw] leading-snug',
                  )}
                >
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right / Lower Section: Direct Touch Action on Mobile vs QR Card on TV/Totem */}
      {isMobile ? (
        <div className="rounded-2xl border border-white/20 bg-black/75 p-3.5 shadow-2xl backdrop-blur-xl">
          <p className="mb-2.5 text-center font-display text-sm font-semibold text-white">
            {promo.ctaLabel}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#CE9E51] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2B2110] shadow-md active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link
              href="/properties"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white active:scale-[0.98]"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#CE9E51]" />
              Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'tick-frame border border-white/20 bg-black/65 shadow-2xl backdrop-blur-xl',
            isPortrait
              ? 'flex items-center justify-between gap-4 rounded-2xl p-4'
              : 'col-span-5 flex flex-col items-center rounded-[1.6vw] p-[2.2vw] text-center',
          )}
        >
          <div className={cn(isPortrait ? 'min-w-0 flex-1' : 'flex flex-col items-center')}>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-sarango-real.jpeg"
                alt={contact.name}
                width={48}
                height={48}
                className={cn(
                  'rounded-full ring-2 ring-[#CE9E51]',
                  isPortrait ? 'h-8 w-8' : 'h-[3.2vw] w-[3.2vw]',
                )}
              />
              <span
                className={cn(
                  'font-semibold uppercase tracking-[0.2em] text-[#CE9E51]',
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
                className={cn('text-[#CE9E51]', isPortrait ? 'h-4 w-4' : 'h-[1.5vw] w-[1.5vw]')}
              />
              {contact.phone}
            </p>
            <p
              className={cn(
                'flex items-center gap-1.5 text-[#E5C185]',
                isPortrait ? 'text-xs' : 'mt-[0.5vh] justify-center text-[1.05vw]',
              )}
            >
              <Globe className={isPortrait ? 'h-3.5 w-3.5' : 'h-[1.05vw] w-[1.05vw]'} />
              {contact.site}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1">
            <div
              className={cn(
                'rounded-2xl bg-white shadow-2xl ring-4 ring-[#CE9E51]/55',
                isPortrait ? 'p-1.5' : 'my-[1.8vh] p-[0.65vw]',
              )}
            >
              <QrCodeSvg
                value={qrUrl}
                className={isPortrait ? 'h-24 w-24' : 'h-[10.5vw] min-h-24 w-[10.5vw] min-w-24'}
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
        </div>
      )}
    </section>
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

  React.useEffect(() => {
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

  const textSizeClass = isPortrait ? 'text-2xl sm:text-3xl' : 'text-[3.5vw]';

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
            style={{
              animationDuration: `${durationSeconds.toFixed(1)}s`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            <span className="whitespace-nowrap pr-10">{title}</span>
            <span
              aria-hidden
              className="inline-flex items-center whitespace-nowrap pr-10 text-[#CE9E51]"
            >
              ✦
            </span>
            <span aria-hidden className="whitespace-nowrap pr-10">
              {title}
            </span>
            <span
              aria-hidden
              className="inline-flex items-center whitespace-nowrap pr-10 text-[#CE9E51]"
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
 */
function BrandOutroSlide({
  contact,
  qrUrl,
  propertyCount,
  isPortrait,
  isMobile,
}: {
  contact: PropertySlideshowProps['contact'];
  qrUrl: string;
  propertyCount: number;
  isPortrait: boolean;
  isMobile: boolean;
}) {
  const pillars = [
    { icon: Building2, label: 'Compra, Venta y Alquiler Residencial y Comercial' },
    { icon: ShieldCheck, label: 'Propiedades Auditadas · Planos y Documentación Verificada' },
    { icon: CheckCircle2, label: 'Asesoría Legal, Financiamiento y Gestión Integral' },
  ];

  return (
    <section
      className={cn(
        'slideshow-content-enter absolute z-10',
        isMobile
          ? 'inset-x-3.5 bottom-12 top-16 flex flex-col justify-between gap-3'
          : isPortrait
            ? 'inset-x-5 bottom-14 top-20 flex flex-col justify-between gap-4'
            : 'inset-x-[4vw] bottom-[11.5vh] top-[14vh] grid grid-cols-12 items-center gap-[3vw]',
      )}
    >
      <div className={cn('flex flex-col justify-center', !isPortrait && 'col-span-7')}>
        <div className={cn('flex items-center', isPortrait ? 'gap-3.5' : 'gap-[1.8vw]')}>
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-full bg-[#CE9E51]/25 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-sarango-real.jpeg"
              alt={contact.name}
              width={200}
              height={200}
              className={cn(
                'relative rounded-full object-cover shadow-2xl ring-4 ring-[#CE9E51]',
                isMobile
                  ? 'h-16 w-16'
                  : isPortrait
                    ? 'h-20 w-20'
                    : 'h-[8.8vw] min-h-24 w-[8.8vw] min-w-24',
              )}
            />
          </div>
          <div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-[#CE9E51]/40 bg-[#CE9E51]/15 font-semibold uppercase tracking-[0.2em] text-[#E5C185]',
                isPortrait ? 'px-2.5 py-0.5 text-[0.62rem]' : 'px-[1vw] py-[0.4vh] text-[0.85vw]',
              )}
            >
              <Sparkles className={isPortrait ? 'h-3 w-3' : 'h-[0.95vw] w-[0.95vw]'} />
              Agencia Inmobiliaria Boutique
            </span>
            <h1
              className={cn(
                'mt-1.5 font-display font-semibold leading-[1.02] tracking-tight text-white',
                isMobile ? 'text-2xl' : isPortrait ? 'text-3xl' : 'text-[4.2vw]',
              )}
            >
              {contact.name}
            </h1>
          </div>
        </div>

        <p
          className={cn(
            'font-display italic text-[#E5C185]',
            isPortrait ? 'mt-2.5 text-lg' : 'mt-[2.4vh] max-w-[50vw] text-[2vw]',
          )}
        >
          “{contact.tagline ?? 'Encuentra tu espacio, sin sorpresas ocultas.'}”
        </p>

        <ul className={cn(isPortrait ? 'mt-2.5 space-y-2' : 'mt-[3vh] space-y-[1.4vh]')}>
          {pillars.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className={cn(
                'flex items-center text-white/90',
                isPortrait ? 'gap-2.5 text-xs' : 'gap-[0.9vw] text-[1.25vw]',
              )}
            >
              <span
                className={cn(
                  'grid shrink-0 place-items-center rounded-lg border border-[#CE9E51]/35 bg-[#CE9E51]/15 text-[#CE9E51]',
                  isPortrait ? 'h-7 w-7' : 'h-[2.4vw] w-[2.4vw]',
                )}
              >
                <Icon className={isPortrait ? 'h-4 w-4' : 'h-[1.3vw] w-[1.3vw]'} />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'flex flex-wrap items-center border-t border-white/15 text-white/75',
            isPortrait
              ? 'mt-2.5 gap-2 pt-2 text-[0.72rem]'
              : 'mt-[3.2vh] gap-[2vw] pt-[2.2vh] text-[1.05vw]',
          )}
        >
          {contact.officeAddress ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#CE9E51]" />
              {contact.officeAddress}
            </span>
          ) : null}
          {contact.hours ? (
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#CE9E51]" />
              {contact.hours}
            </span>
          ) : null}
        </div>
      </div>

      {/* Right / Bottom Action Card: Direct Touch Buttons on Mobile vs QR Card on TV/Totem */}
      {isMobile ? (
        <div className="rounded-2xl border border-white/20 bg-black/75 p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="mb-2.5 flex items-center justify-between text-xs text-white/80">
            <span className="font-semibold uppercase tracking-wider text-[#CE9E51]">
              Contacto Directo
            </span>
            <a
              href={`tel:${contact.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 font-bold tabular-nums text-white"
            >
              <Phone className="h-3.5 w-3.5 text-[#CE9E51]" />
              {contact.phone}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#CE9E51] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2B2110] shadow-md active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link
              href="/properties"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white active:scale-[0.98]"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#CE9E51]" />
              Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div
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
                'inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.22em] text-[#CE9E51]',
                isPortrait ? 'text-[0.65rem]' : 'text-[0.9vw]',
              )}
            >
              <QrCode className={isPortrait ? 'h-3.5 w-3.5' : 'h-[1.1vw] w-[1.1vw]'} />
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
                  className={cn('text-[#CE9E51]', isPortrait ? 'h-4 w-4' : 'h-[1.6vw] w-[1.6vw]')}
                />
                {contact.phone}
              </p>
              <p
                className={cn(
                  'flex items-center gap-1.5 text-[#E5C185]',
                  isPortrait ? 'text-xs' : 'justify-center text-[1.15vw]',
                )}
              >
                <Globe className={isPortrait ? 'h-3.5 w-3.5' : 'h-[1.15vw] w-[1.15vw]'} />
                {contact.site}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'shrink-0 rounded-2xl bg-white shadow-2xl ring-4 ring-[#CE9E51]/55',
              isPortrait ? 'p-1.5' : 'my-[2vh] p-[0.7vw]',
            )}
          >
            <QrCodeSvg
              value={qrUrl}
              className={isPortrait ? 'h-24 w-24' : 'h-[11.5vw] min-h-28 w-[11.5vw] min-w-28'}
            />
          </div>
        </div>
      )}
    </section>
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
  ultraCompact = false,
}: {
  city: string;
  coordinates: { lat: number; lng: number };
  initialWeather: SlideshowWeather | null;
  compact?: boolean;
  ultraCompact?: boolean;
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
        if (typeof fetch !== 'function') return;
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

  if (ultraCompact) {
    return (
      <div className="flex items-center gap-1">
        <Icon className="h-3.5 w-3.5 text-[#CE9E51]" />
        <span className="font-mono text-xs font-bold tabular-nums text-white">
          {current.tempC}°C
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'grid place-items-center rounded-xl bg-[#CE9E51]/20 text-[#CE9E51]',
          compact ? 'h-8 w-8' : 'h-[2.6vw] min-h-8 w-[2.6vw] min-w-8',
        )}
      >
        <Icon className={compact ? 'h-4 w-4' : 'h-[1.5vw] w-[1.5vw]'} />
      </div>
      <div className="leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'font-mono font-bold tabular-nums text-white',
              compact ? 'text-sm' : 'text-[1.45vw]',
            )}
          >
            {current.tempC}°C
          </span>
          <span
            className={cn(
              'font-semibold uppercase tracking-[0.14em] text-[#CE9E51]',
              compact ? 'text-[0.6rem]' : 'text-[0.8vw]',
            )}
          >
            {city}
          </span>
        </div>
        <p className={cn('text-white/65', compact ? 'text-[0.62rem]' : 'text-[0.75vw]')}>{label}</p>
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

const DAYS_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function formatEsTimeAndDate(date: Date): { timeStr: string; dateStr: string } {
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours24 >= 12 ? 'p. m.' : 'a. m.';
  const hours12 = hours24 % 12 || 12;
  const timeStr = `${String(hours12).padStart(2, '0')}:${minutes} ${period}`;
  const dateStr = `${DAYS_ES[date.getDay()] ?? ''}, ${date.getDate()} ${MONTHS_ES[date.getMonth()] ?? ''}`;
  return { timeStr, dateStr };
}

/** Rendered client-only with zero ICU locale dependency so Smart TVs never throw RangeError. */
function ClockWidget({
  compact = false,
  ultraCompact = false,
}: {
  compact?: boolean;
  ultraCompact?: boolean;
}) {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 10_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;

  const { timeStr, dateStr } = formatEsTimeAndDate(now);

  if (ultraCompact) {
    return <span className="font-mono text-xs font-bold tabular-nums text-white">{timeStr}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Clock3 className={cn('text-[#CE9E51]', compact ? 'h-4 w-4' : 'h-[1.4vw] w-[1.4vw]')} />
      <div className="leading-tight">
        <p
          className={cn(
            'font-mono font-bold tabular-nums text-white',
            compact ? 'text-sm' : 'text-[1.35vw]',
          )}
        >
          {timeStr}
        </p>
        <p
          className={cn(
            'capitalize tracking-[0.12em] text-white/65',
            compact ? 'text-[0.62rem]' : 'text-[0.75vw]',
          )}
        >
          {dateStr}
        </p>
      </div>
    </div>
  );
}

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
      className="grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
    >
      {children}
    </button>
  );
}
