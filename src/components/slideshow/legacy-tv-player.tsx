import * as React from 'react';
import { formatArea, formatPrice, getStatusLabel, getTypeLabel } from '@/lib/format';
import { generateQrSvgData } from '@/components/slideshow/qr-code-svg';
import type {
  SlideshowContact,
  SlideshowProperty,
  SlideshowWeather,
} from '@/components/slideshow/property-slideshow';

interface LegacySpecItem {
  value: string;
  label: string;
}

interface LegacyPropertySlide {
  kind: 'property';
  title: string;
  isLongTitle: boolean;
  featured: boolean;
  statusLabel: string;
  statusIsRent: boolean;
  typeLabel: string;
  addressLine: string;
  priceLabel: string;
  periodLabel: string;
  reference: string;
  specs: LegacySpecItem[];
  perks: string[];
  images: string[];
  qr: { total: number; pathData: string };
}

interface LegacyPromoSlide {
  kind: 'promo';
  eyebrow: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  backgroundImage: string;
  highlights: Array<{ title: string; detail: string }>;
  qr: { total: number; pathData: string };
}

interface LegacyBrandSlide {
  kind: 'brand';
  qr: { total: number; pathData: string };
}

type LegacySlide = LegacyPropertySlide | LegacyPromoSlide | LegacyBrandSlide;

interface LegacyPayload {
  intervalMs: number;
  contact: {
    name: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    site: string;
    hours: string;
    officeCity: string;
    officeAddress: string;
  };
  weather: {
    tempC: number;
    label: string;
  } | null;
  slides: LegacySlide[];
}

const PERIOD_LABELS: Record<string, string> = {
  month: '/mes',
  week: '/semana',
  day: '/día',
  year: '/año',
};

const PROMO_CAMPAIGNS = [
  {
    id: 'promo-propietarios',
    eyebrow: 'Captación de Propiedades Exclusivas',
    badge: '¿Deseas Vender o Alquilar?',
    title: 'Comercializamos tu propiedad con respaldo legal y vitrina premium',
    subtitle:
      'Exhibimos tu inmueble ante miles de compradores e inversionistas en nuestras pantallas publicitarias, portal web y canales digitales.',
    ctaLabel: 'Consigna tu propiedad hoy',
    whatsappText:
      'Hola Sarango Real Estate, quiero información para vender o alquilar mi propiedad.',
    backgroundImage: '/images/hero-cuenca.jpg',
    highlights: [
      {
        title: 'Auditoría y Avalúo Real',
        detail: 'Planos medidos, revisión documental y precio competitivo de mercado.',
      },
      {
        title: 'Máxima Exposición Comercial',
        detail: 'Presencia en pantallas digitales, portal web y redes sociales.',
      },
      {
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
        title: 'Cero Sorpresas Técnicas',
        detail: 'Inspección previa de instalaciones, metrajes reales y estado legal.',
      },
      {
        title: 'Crédito Hipotecario y Legal',
        detail: 'Coordinamos avalúos bancarios, financiamiento y escrituración.',
      },
      {
        title: 'Atención Personalizada',
        detail: 'Recorridos presenciales o en video en vivo si resides en el exterior.',
      },
    ],
  },
];

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Despejado';
  if (code === 1 || code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code === 45 || code === 48) return 'Neblina';
  if (code >= 51 && code <= 67) return 'Lluvia ligera';
  if (code >= 71 && code <= 82) return 'Lluvia';
  if (code >= 95) return 'Tormenta';
  return 'Templado';
}

function buildLegacyPayload(
  properties: SlideshowProperty[],
  intervalMs: number,
  showBrandSlide: boolean,
  showPromoSlides: boolean,
  initialWeather: SlideshowWeather | null,
  contact: SlideshowContact,
): LegacyPayload {
  const slides: LegacySlide[] = [];
  const whatsappDigits = (contact.whatsapp || contact.phone).replace(/\D/g, '');
  const promoIntervalCount = 2;
  let promoCursor = 0;

  properties.forEach((prop, idx) => {
    const specs: LegacySpecItem[] = [];
    if (prop.bedrooms > 0) {
      specs.push({
        value: String(prop.bedrooms),
        label: prop.bedrooms === 1 ? 'HABITACIÓN' : 'HABITACIONES',
      });
    }
    if (prop.bathrooms > 0) {
      specs.push({
        value: String(prop.bathrooms),
        label: prop.bathrooms === 1 ? 'BAÑO' : 'BAÑOS',
      });
    }
    if (prop.garages > 0) {
      specs.push({
        value: String(prop.garages),
        label: prop.garages === 1 ? 'GARAJE' : 'GARAJES',
      });
    }
    if (prop.area > 0) {
      specs.push({
        value: formatArea(prop.area),
        label: prop.type === 'land' ? 'SUPERFICIE' : 'CONSTRUCCIÓN',
      });
    }
    if (prop.landArea && prop.landArea > 0 && prop.type !== 'land') {
      specs.push({
        value: formatArea(prop.landArea),
        label: 'TERRENO',
      });
    }

    const perks: string[] = [];
    if (prop.status === 'for-rent' && prop.utilitiesIncluded) {
      perks.push('Servicios incluidos');
    }
    if (prop.status === 'for-rent' && prop.petsAllowed) {
      perks.push('Acepta mascotas');
    }
    if (prop.hoaFee && prop.hoaFee > 0) {
      perks.push(`Alícuota ${formatPrice(prop.hoaFee)}/mes`);
    }

    const propQrUrl = whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, me interesa la propiedad Ref. ${prop.reference}`)}`
      : `${contact.url || `https://${contact.site}`}/properties/${prop.slug}`;

    slides.push({
      kind: 'property',
      title: prop.title,
      isLongTitle: prop.title.trim().length > 34,
      featured: Boolean(prop.featured),
      statusLabel: getStatusLabel(prop.status),
      statusIsRent: prop.status === 'for-rent',
      typeLabel: getTypeLabel(prop.type),
      addressLine: prop.address ? `${prop.address}, ${prop.city}` : prop.city,
      priceLabel: formatPrice(prop.price),
      periodLabel: prop.pricePeriod ? (PERIOD_LABELS[prop.pricePeriod] ?? '') : '',
      reference: prop.reference,
      specs,
      perks,
      images: prop.images,
      qr: generateQrSvgData(propQrUrl),
    });

    const countSoFar = idx + 1;
    const isLastProperty = countSoFar === properties.length;
    if (
      showPromoSlides &&
      (countSoFar % promoIntervalCount === 0 ||
        (isLastProperty && properties.length < promoIntervalCount))
    ) {
      const promo = PROMO_CAMPAIGNS[promoCursor % PROMO_CAMPAIGNS.length];
      promoCursor += 1;
      const promoQrUrl = whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(promo.whatsappText)}`
        : contact.url || `https://${contact.site}`;
      slides.push({
        kind: 'promo',
        eyebrow: promo.eyebrow,
        badge: promo.badge,
        title: promo.title,
        subtitle: promo.subtitle,
        ctaLabel: promo.ctaLabel,
        backgroundImage: promo.backgroundImage,
        highlights: promo.highlights,
        qr: generateQrSvgData(promoQrUrl),
      });
    }
  });

  if (showBrandSlide || slides.length === 0) {
    const brandQrUrl = whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hola Sarango Real Estate, deseo recibir información sobre sus propiedades disponibles.')}`
      : contact.url || `https://${contact.site}`;
    slides.push({
      kind: 'brand',
      qr: generateQrSvgData(brandQrUrl),
    });
  }

  return {
    intervalMs,
    contact: {
      name: contact.name,
      tagline: contact.tagline ?? '',
      phone: contact.phone,
      whatsapp: contact.whatsapp ?? contact.phone,
      site: contact.site,
      hours: contact.hours ?? '',
      officeCity: contact.officeCity ?? 'Cuenca',
      officeAddress: contact.officeAddress ?? 'Cuenca, Ecuador',
    },
    weather: initialWeather
      ? {
          tempC: initialWeather.tempC,
          label: getWeatherDescription(initialWeather.weatherCode),
        }
      : {
          tempC: 19,
          label: 'Templado',
        },
    slides,
  };
}

/**
 * Pure ES5 self-contained Smart TV Slideshow Engine.
 * Automatically activates if React 19 / Next.js 16 client bundles fail to parse or
 * hydrate on legacy Smart TV browsers (older LG webOS, Samsung Tizen, Opera TV, Android TV).
 */
const LEGACY_TV_ENGINE_SCRIPT = `
(function() {
  var started = false;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function getFormattedClock() {
    var d = new Date();
    var h24 = d.getHours();
    var m = pad2(d.getMinutes());
    var isPm = h24 >= 12;
    var h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    var timeStr = pad2(h12) + ':' + m + (isPm ? ' p. m.' : ' a. m.');
    var days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    var months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var dateStr = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
    return { time: timeStr, date: dateStr };
  }

  function renderQrSvg(qr, sizePx) {
    if (!qr || !qr.pathData) return '';
    var s = sizePx || 108;
    return '<svg viewBox="0 0 ' + qr.total + ' ' + qr.total + '" width="' + s + '" height="' + s + '" shape-rendering="crispEdges" style="display:block;background:#FFFFFF;border-radius:8px;padding:4px;box-sizing:border-box;">' +
      '<rect width="' + qr.total + '" height="' + qr.total + '" fill="#FFFFFF"></rect>' +
      '<path d="' + qr.pathData + '" fill="#0A0F0D"></path>' +
    '</svg>';
  }

  function startLegacyTvSlideshow() {
    if (started) return true;
    var payloadEl = document.getElementById('tv-slideshow-payload');
    if (!payloadEl) return false;

    var payload;
    try {
      payload = JSON.parse(payloadEl.textContent || payloadEl.innerText || '{}');
    } catch (e) {
      return false;
    }
    if (!payload || !payload.slides || !payload.slides.length) return false;

    started = true;
    window.__TV_LEGACY_ACTIVE__ = true;

    var slides = payload.slides;
    var totalSlides = slides.length;
    var intervalMs = payload.intervalMs || 12000;
    var contact = payload.contact || {};
    var weather = payload.weather || { tempC: 19, label: 'Templado' };

    var currentIndex = 0;
    var currentImageIndex = 0;
    var elapsedMs = 0;
    var paused = false;
    var tickMs = 250;

    var host = document.getElementById('tv-legacy-slideshow-root');
    if (!host) {
      host = document.createElement('div');
      host.id = 'tv-legacy-slideshow-root';
      document.body.appendChild(host);
    }
    host.setAttribute('style', 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:99990;background:#0A0F0D;color:#FFFFFF;overflow:hidden;font-family:Manrope,system-ui,-apple-system,sans-serif;-webkit-user-select:none;user-select:none;');

    function renderTopBar(slideIdx) {
      var clock = getFormattedClock();
      var idxStr = pad2(slideIdx + 1) + ' / ' + pad2(totalSlides);
      var slideKind = slides[slideIdx].kind === 'property' ? 'PROPIEDAD' : (slides[slideIdx].kind === 'promo' ? 'DESTACADO' : 'INSTITUCIONAL');

      return '<div style="position:absolute;top:0;left:0;right:0;z-index:20;padding:28px 48px;overflow:hidden;">' +
        '<div style="float:left;">' +
          '<div style="display:inline-block;vertical-align:middle;width:54px;height:54px;border-radius:50%;overflow:hidden;background:#FFFFFF;border:2px solid rgba(206,158,81,0.6);margin-right:14px;">' +
            '<img src="/images/logo-sarango-real.jpeg" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />' +
          '</div>' +
          '<div style="display:inline-block;vertical-align:middle;">' +
            '<div style="font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:600;color:#FFFFFF;line-height:1.15;">' + escapeHtml(contact.name) + '</div>' +
            '<div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CE9E51;margin-top:3px;">Bienes Raíces · Ecuador</div>' +
          '</div>' +
        '</div>' +
        '<div style="float:right;background:rgba(10,15,13,0.72);border:1px solid rgba(255,255,255,0.16);border-radius:40px;padding:10px 22px;font-size:14px;line-height:1.2;">' +
          '<span style="color:#CE9E51;font-weight:700;margin-right:8px;">' + escapeHtml(weather.tempC) + '°C</span>' +
          '<span style="color:rgba(255,255,255,0.75);margin-right:16px;">' + escapeHtml(contact.officeCity || 'Cuenca') + ' · ' + escapeHtml(weather.label) + '</span>' +
          '<span style="border-left:1px solid rgba(255,255,255,0.2);padding-left:16px;margin-right:16px;color:#FFFFFF;font-weight:600;" id="tv-legacy-clock-time">' + escapeHtml(clock.time) + '</span>' +
          '<span style="color:rgba(255,255,255,0.65);margin-right:16px;text-transform:capitalize;" id="tv-legacy-clock-date">' + escapeHtml(clock.date) + '</span>' +
          '<span style="border-left:1px solid rgba(255,255,255,0.2);padding-left:16px;color:#CE9E51;font-size:11px;letter-spacing:0.18em;font-weight:700;margin-right:8px;">' + slideKind + '</span>' +
          '<span style="color:#FFFFFF;font-family:monospace;font-size:13px;">' + idxStr + '</span>' +
        '</div>' +
      '</div>';
    }

    function renderPropertySlide(slide, imgIdx) {
      var imgs = slide.images && slide.images.length ? slide.images : ['/images/hero-cuenca.jpg'];
      var safeImgIdx = imgIdx % imgs.length;
      var bgUrl = imgs[safeImgIdx];

      var badgesHtml = '';
      if (slide.featured) {
        badgesHtml += '<span style="display:inline-block;background:rgba(206,158,81,0.22);border:1px solid rgba(206,158,81,0.65);color:#F3D299;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-right:10px;">Propiedad Destacada</span>';
      }
      var statusBg = slide.statusIsRent ? '#CE9E51' : '#FFFFFF';
      var statusColor = '#0A0F0D';
      badgesHtml += '<span style="display:inline-block;background:' + statusBg + ';color:' + statusColor + ';padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-right:10px;">' + escapeHtml(slide.statusLabel) + '</span>';
      badgesHtml += '<span style="display:inline-block;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);color:#FFFFFF;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin-right:10px;">' + escapeHtml(slide.typeLabel) + '</span>';

      for (var p = 0; p < (slide.perks || []).length; p++) {
        badgesHtml += '<span style="display:inline-block;background:rgba(16,185,129,0.2);border:1px solid rgba(52,211,153,0.45);color:#A7F3D0;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;margin-right:10px;">' + escapeHtml(slide.perks[p]) + '</span>';
      }

      var titleHtml = '';
      if (slide.isLongTitle) {
        titleHtml = '<div style="overflow:hidden;white-space:nowrap;width:100%;margin:14px 0 10px 0;">' +
          '<div class="tv-legacy-marquee" style="display:inline-block;white-space:nowrap;font-family:Fraunces,Georgia,serif;font-size:50px;font-weight:600;line-height:1.14;color:#FFFFFF;-webkit-animation:tv-legacy-marquee-anim 14s linear infinite;animation:tv-legacy-marquee-anim 14s linear infinite;">' +
            '<span style="padding-right:48px;">' + escapeHtml(slide.title) + '</span>' +
            '<span style="color:#CE9E51;padding-right:48px;">✦</span>' +
            '<span style="padding-right:48px;">' + escapeHtml(slide.title) + '</span>' +
            '<span style="color:#CE9E51;padding-right:48px;">✦</span>' +
          '</div>' +
        '</div>';
      } else {
        titleHtml = '<div style="font-family:Fraunces,Georgia,serif;font-size:50px;font-weight:600;line-height:1.14;color:#FFFFFF;margin:14px 0 10px 0;">' + escapeHtml(slide.title) + '</div>';
      }

      var specsHtml = '';
      if (slide.specs && slide.specs.length) {
        specsHtml = '<div style="margin-top:18px;padding:14px 0;border-top:1px solid rgba(255,255,255,0.16);border-bottom:1px solid rgba(255,255,255,0.16);">';
        for (var s = 0; s < slide.specs.length; s++) {
          var sp = slide.specs[s];
          specsHtml += '<div style="display:inline-block;vertical-align:top;margin-right:36px;">' +
            '<div style="font-family:Fraunces,Georgia,serif;font-size:28px;font-weight:600;color:#FFFFFF;line-height:1.1;">' + escapeHtml(sp.value) + '</div>' +
            '<div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.62);margin-top:4px;">' + escapeHtml(sp.label) + '</div>' +
          '</div>';
        }
        specsHtml += '</div>';
      }

      var dotsHtml = '';
      if (imgs.length > 1) {
        dotsHtml = '<div style="margin-top:18px;">';
        for (var d = 0; d < imgs.length; d++) {
          var dotW = d === safeImgIdx ? '36px' : '12px';
          var dotBg = d === safeImgIdx ? '#CE9E51' : 'rgba(255,255,255,0.35)';
          dotsHtml += '<span id="tv-legacy-dot-' + d + '" style="display:inline-block;height:5px;width:' + dotW + ';background:' + dotBg + ';border-radius:4px;margin-right:8px;"></span>';
        }
        dotsHtml += '<span id="tv-legacy-photo-counter" style="font-size:11px;font-family:monospace;letter-spacing:0.18em;color:rgba(255,255,255,0.65);margin-left:8px;">FOTO ' + (safeImgIdx + 1) + '/' + imgs.length + '</span></div>';
      }

      return '<div style="position:relative;width:100%;height:100%;overflow:hidden;">' +
        '<img id="tv-legacy-bg-img" src="' + escapeHtml(bgUrl) + '" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;" />' +
        '<div style="position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(to top, rgba(10,15,13,0.96) 0%, rgba(10,15,13,0.62) 45%, rgba(10,15,13,0.3) 100%);"></div>' +
        renderTopBar(currentIndex) +
        '<div style="position:absolute;left:48px;right:48px;bottom:36px;z-index:15;overflow:hidden;">' +
          '<div style="width:64%;float:left;padding-right:24px;box-sizing:border-box;">' +
            '<div>' + badgesHtml + '</div>' +
            titleHtml +
            '<div style="font-size:18px;color:rgba(255,255,255,0.85);margin-bottom:6px;">📍 ' + escapeHtml(slide.addressLine) + '</div>' +
            specsHtml +
            '<div style="margin-top:18px;">' +
              '<span style="font-family:Fraunces,Georgia,serif;font-size:64px;font-weight:600;color:#CE9E51;line-height:1;">' + escapeHtml(slide.priceLabel) + '</span>' +
              (slide.periodLabel ? '<span style="font-family:Fraunces,Georgia,serif;font-size:30px;color:rgba(206,158,81,0.82);margin-left:6px;">' + escapeHtml(slide.periodLabel) + '</span>' : '') +
            '</div>' +
            dotsHtml +
          '</div>' +
          '<div style="width:34%;float:right;background:rgba(10,15,13,0.86);border:1px solid rgba(206,158,81,0.42);border-radius:18px;padding:22px;box-sizing:border-box;">' +
            '<div style="overflow:hidden;">' +
              '<div style="float:left;width:62%;padding-right:12px;box-sizing:border-box;">' +
                '<div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CE9E51;font-weight:700;">Agenda tu visita</div>' +
                '<div style="font-family:Fraunces,Georgia,serif;font-size:26px;font-weight:600;color:#FFFFFF;margin-top:8px;line-height:1.15;">' + escapeHtml(contact.phone) + '</div>' +
                '<div style="font-size:14px;color:rgba(255,255,255,0.78);margin-top:8px;">🌐 ' + escapeHtml(contact.site) + '</div>' +
                '<div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.14);font-size:12px;color:rgba(255,255,255,0.65);font-family:monospace;">Ref. <strong style="color:#FFFFFF;">' + escapeHtml(slide.reference) + '</strong></div>' +
              '</div>' +
              '<div style="float:right;width:36%;text-align:center;">' +
                '<div style="display:inline-block;">' + renderQrSvg(slide.qr, 108) + '</div>' +
                '<div style="font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#CE9E51;font-weight:700;margin-top:6px;">Escanéame</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:rgba(255,255,255,0.14);z-index:25;">' +
          '<div id="tv-legacy-progress" style="height:100%;width:0%;background:#CE9E51;"></div>' +
        '</div>' +
      '</div>';
    }

    function renderPromoSlide(slide) {
      var cardsHtml = '';
      for (var i = 0; i < (slide.highlights || []).length; i++) {
        var h = slide.highlights[i];
        cardsHtml += '<div style="display:inline-block;vertical-align:top;width:31%;margin-right:2%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:16px;box-sizing:border-box;">' +
          '<div style="font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:600;color:#CE9E51;margin-bottom:6px;">✦ ' + escapeHtml(h.title) + '</div>' +
          '<div style="font-size:13px;line-height:1.45;color:rgba(255,255,255,0.78);">' + escapeHtml(h.detail) + '</div>' +
        '</div>';
      }

      return '<div style="position:relative;width:100%;height:100%;overflow:hidden;">' +
        '<img src="' + escapeHtml(slide.backgroundImage) + '" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.32;display:block;" />' +
        '<div style="position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(135deg, rgba(10,15,13,0.96) 0%, rgba(10,15,13,0.82) 60%, rgba(10,15,13,0.94) 100%);"></div>' +
        renderTopBar(currentIndex) +
        '<div style="position:absolute;left:48px;right:48px;bottom:42px;z-index:15;overflow:hidden;">' +
          '<div style="width:64%;float:left;padding-right:24px;box-sizing:border-box;">' +
            '<div style="margin-bottom:14px;">' +
              '<span style="display:inline-block;background:#CE9E51;color:#0A0F0D;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-right:10px;">' + escapeHtml(slide.badge) + '</span>' +
              '<span style="display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.85);padding:6px 14px;border-radius:20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">' + escapeHtml(slide.eyebrow) + '</span>' +
            '</div>' +
            '<div style="font-family:Fraunces,Georgia,serif;font-size:48px;font-weight:600;line-height:1.12;color:#FFFFFF;margin-bottom:14px;">' + escapeHtml(slide.title) + '</div>' +
            '<div style="font-size:18px;line-height:1.5;color:rgba(255,255,255,0.8);margin-bottom:24px;">' + escapeHtml(slide.subtitle) + '</div>' +
            '<div>' + cardsHtml + '</div>' +
          '</div>' +
          '<div style="width:33%;float:right;background:rgba(10,15,13,0.9);border:1px solid rgba(206,158,81,0.48);border-radius:20px;padding:26px;text-align:center;box-sizing:border-box;">' +
            '<div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#CE9E51;font-weight:700;margin-bottom:12px;">' + escapeHtml(slide.ctaLabel) + '</div>' +
            '<div style="display:inline-block;margin:8px 0;">' + renderQrSvg(slide.qr, 132) + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:8px;">Escanea con la cámara de tu celular para atención por <strong style="color:#CE9E51;">WhatsApp</strong></div>' +
            '<div style="font-family:Fraunces,Georgia,serif;font-size:26px;font-weight:600;color:#FFFFFF;margin-top:14px;">' + escapeHtml(contact.phone) + '</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">' + escapeHtml(contact.site) + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:rgba(255,255,255,0.14);z-index:25;">' +
          '<div id="tv-legacy-progress" style="height:100%;width:0%;background:#CE9E51;"></div>' +
        '</div>' +
      '</div>';
    }

    function renderBrandSlide(slide) {
      return '<div style="position:relative;width:100%;height:100%;overflow:hidden;background:#080C0A;">' +
        '<img src="/images/sarango-office-wall.jpg" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.22;display:block;" />' +
        '<div style="position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 50% 45%, rgba(206,158,81,0.16), rgba(8,12,10,0.96) 70%);"></div>' +
        renderTopBar(currentIndex) +
        '<div style="position:absolute;top:110px;bottom:48px;left:48px;right:48px;z-index:15;text-align:center;">' +
          '<div style="display:inline-block;width:136px;height:136px;border-radius:50%;overflow:hidden;background:#FFFFFF;border:3px solid #CE9E51;padding:6px;box-sizing:border-box;box-shadow:0 16px 50px rgba(0,0,0,0.75);">' +
            '<img src="/images/logo-sarango-real.jpeg" alt="' + escapeHtml(contact.name) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />' +
          '</div>' +
          '<div style="margin-top:14px;">' +
            '<span style="display:inline-block;background:rgba(206,158,81,0.16);border:1px solid rgba(206,158,81,0.45);color:#CE9E51;padding:5px 18px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;">Bienes Raíces · Cuenca, Ecuador</span>' +
          '</div>' +
          '<div style="font-family:Fraunces,Georgia,serif;font-size:56px;font-weight:600;color:#FFFFFF;margin-top:12px;line-height:1.08;">' + escapeHtml(contact.name) + '</div>' +
          '<div style="font-size:19px;color:rgba(255,255,255,0.78);max-width:780px;margin:10px auto 26px auto;line-height:1.45;">' + escapeHtml(contact.tagline) + '</div>' +
          '<div style="max-width:1060px;margin:0 auto;background:rgba(10,15,13,0.86);border:1px solid rgba(255,255,255,0.16);border-radius:20px;padding:24px 32px;text-align:left;overflow:hidden;box-sizing:border-box;">' +
            '<div style="width:34%;float:left;padding-right:20px;border-right:1px solid rgba(255,255,255,0.12);box-sizing:border-box;">' +
              '<div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CE9E51;font-weight:700;">Atención Directa</div>' +
              '<div style="font-family:Fraunces,Georgia,serif;font-size:28px;font-weight:600;color:#FFFFFF;margin-top:8px;">' + escapeHtml(contact.phone) + '</div>' +
              '<div style="font-size:15px;color:rgba(255,255,255,0.82);margin-top:8px;">🌐 ' + escapeHtml(contact.site) + '</div>' +
            '</div>' +
            '<div style="width:36%;float:left;padding:0 20px;border-right:1px solid rgba(255,255,255,0.12);box-sizing:border-box;">' +
              '<div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CE9E51;font-weight:700;">Oficina Central</div>' +
              '<div style="font-size:15px;font-weight:600;color:#FFFFFF;margin-top:8px;">📍 ' + escapeHtml(contact.officeAddress) + '</div>' +
              '<div style="font-size:13px;color:rgba(255,255,255,0.68);margin-top:8px;">🕒 ' + escapeHtml(contact.hours) + '</div>' +
            '</div>' +
            '<div style="width:28%;float:right;padding-left:16px;box-sizing:border-box;">' +
              '<div style="float:left;margin-right:14px;">' + renderQrSvg(slide.qr, 86) + '</div>' +
              '<div style="padding-top:10px;">' +
                '<div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#CE9E51;font-weight:700;">Catálogo y WhatsApp</div>' +
                '<div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:6px;line-height:1.35;">Escanea el código QR con tu celular para atención inmediata.</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:rgba(255,255,255,0.14);z-index:25;">' +
          '<div id="tv-legacy-progress" style="height:100%;width:0%;background:#CE9E51;"></div>' +
        '</div>' +
      '</div>';
    }

    function renderCurrentSlide() {
      var slide = slides[currentIndex];
      if (!slide) return;
      if (slide.kind === 'property') {
        host.innerHTML = renderPropertySlide(slide, currentImageIndex);
      } else if (slide.kind === 'promo') {
        host.innerHTML = renderPromoSlide(slide);
      } else {
        host.innerHTML = renderBrandSlide(slide);
      }
    }

    function goSlide(nextIdx) {
      currentIndex = ((nextIdx % totalSlides) + totalSlides) % totalSlides;
      currentImageIndex = 0;
      elapsedMs = 0;
      renderCurrentSlide();
    }

    renderCurrentSlide();

    setInterval(function() {
      var clock = getFormattedClock();
      var timeEl = document.getElementById('tv-legacy-clock-time');
      var dateEl = document.getElementById('tv-legacy-clock-date');
      if (timeEl) timeEl.innerHTML = escapeHtml(clock.time);
      if (dateEl) dateEl.innerHTML = escapeHtml(clock.date);

      if (paused) return;
      elapsedMs += tickMs;
      if (elapsedMs >= intervalMs) {
        goSlide(currentIndex + 1);
        return;
      }

      var progressEl = document.getElementById('tv-legacy-progress');
      if (progressEl) {
        var pct = Math.min(100, Math.round((elapsedMs / intervalMs) * 100));
        progressEl.style.width = pct + '%';
      }

      var slide = slides[currentIndex];
      if (slide && slide.kind === 'property' && slide.images && slide.images.length > 1) {
        var imgCount = slide.images.length;
        var imgDur = intervalMs / imgCount;
        var newImgIdx = Math.min(Math.floor(elapsedMs / imgDur), imgCount - 1);
        if (newImgIdx !== currentImageIndex) {
          currentImageIndex = newImgIdx;
          var bgImg = document.getElementById('tv-legacy-bg-img');
          if (bgImg) {
            bgImg.src = slide.images[currentImageIndex];
            for (var dIdx = 0; dIdx < imgCount; dIdx++) {
              var dotEl = document.getElementById('tv-legacy-dot-' + dIdx);
              if (dotEl) {
                dotEl.style.width = dIdx === currentImageIndex ? '36px' : '12px';
                dotEl.style.background = dIdx === currentImageIndex ? '#CE9E51' : 'rgba(255,255,255,0.35)';
              }
            }
            var counterEl = document.getElementById('tv-legacy-photo-counter');
            if (counterEl) {
              counterEl.innerHTML = 'FOTO ' + (currentImageIndex + 1) + '/' + imgCount;
            }
          } else {
            renderCurrentSlide();
          }
        }
      }
    }, tickMs);

    window.addEventListener('keydown', function(e) {
      var code = e.keyCode || e.which;
      if (code === 39) {
        goSlide(currentIndex + 1);
      } else if (code === 37) {
        goSlide(currentIndex - 1);
      } else if (code === 13 || code === 32 || code === 179) {
        paused = !paused;
      }
    });

    setInterval(function() {
      try {
        window.location.reload();
      } catch (err) {}
    }, 600000);

    return true;
  }

  window.__startLegacyTvSlideshow = startLegacyTvSlideshow;

  setTimeout(function() {
    if (!window.__TV_REACT_HYDRATED__) {
      startLegacyTvSlideshow();
    }
  }, 3500);
})();
`;

const LEGACY_TV_KEYFRAMES_CSS = `
@-webkit-keyframes tv-legacy-marquee-anim {
  0%, 12% { -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); }
  92%, 100% { -webkit-transform: translate3d(-50%, 0, 0); transform: translate3d(-50%, 0, 0); }
}
@keyframes tv-legacy-marquee-anim {
  0%, 12% { -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); }
  92%, 100% { -webkit-transform: translate3d(-50%, 0, 0); transform: translate3d(-50%, 0, 0); }
}
`;

export function LegacyTvSlideshowFallback({
  properties,
  intervalMs,
  showBrandSlide,
  showPromoSlides,
  initialWeather,
  contact,
}: {
  properties: SlideshowProperty[];
  intervalMs: number;
  showBrandSlide: boolean;
  showPromoSlides: boolean;
  initialWeather: SlideshowWeather | null;
  contact: SlideshowContact;
}) {
  const payload = buildLegacyPayload(
    properties,
    intervalMs,
    showBrandSlide,
    showPromoSlides,
    initialWeather,
    contact,
  );

  // Escape closing script tags in JSON just in case
  const safeJson = JSON.stringify(payload).replace(/</g, '\\u003c');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEGACY_TV_KEYFRAMES_CSS }} />
      <script
        id="tv-slideshow-payload"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: safeJson }}
      />
      <script dangerouslySetInnerHTML={{ __html: LEGACY_TV_ENGINE_SCRIPT }} />
    </>
  );
}
