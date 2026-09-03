import type { Language } from '@/i18n/types';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat('en-US');

export const formatPrice = (value: number) => currency.format(value);
export const formatMoney = (value: number) => currencyPrecise.format(value);
export const formatCompact = (value: number) => compact.format(value);
export const formatNumber = (value: number) => decimal.format(value);

export function formatArea(value: number, lang: Language = 'es') {
  if (lang === 'es') {
    return `${decimal.format(value)} m²`;
  }
  return `${decimal.format(value)} sq ft`;
}

export function formatListingPrice(
  price: number,
  period: 'month' | 'total',
  lang: Language = 'es',
) {
  if (period === 'month') {
    return lang === 'es' ? `${currency.format(price)}/mes` : `${currency.format(price)}/mo`;
  }
  return currency.format(price);
}

export function formatDate(iso: string, lang: Language = 'es') {
  return new Date(iso).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function relativeTime(iso: string, lang: Language = 'es') {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / 86400000);
  if (lang === 'es') {
    if (days < 1) return 'Hoy';
    if (days < 30) return `Hace ${days} día${days === 1 ? '' : 's'}`;
    const months = Math.round(days / 30);
    if (months < 12) return `Hace ${months} mes${months === 1 ? '' : 'es'}`;
    return `Hace ${Math.round(months / 12)} año${Math.round(months / 12) === 1 ? '' : 's'}`;
  }
  if (days < 1) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  return `${Math.round(months / 12)} yr ago`;
}

export const statusLabelEs: Record<string, string> = {
  'for-sale': 'En venta',
  'for-rent': 'En alquiler',
  sold: 'Vendida',
  'new-development': 'Obra nueva',
};

export const statusLabelEn: Record<string, string> = {
  'for-sale': 'For sale',
  'for-rent': 'For rent',
  sold: 'Sold',
  'new-development': 'New development',
};

export function getStatusLabel(status: string, lang: Language = 'es'): string {
  if (lang === 'es') return statusLabelEs[status] || status;
  return statusLabelEn[status] || status;
}

export const typeLabelEs: Record<string, string> = {
  house: 'Casa',
  apartment: 'Departamento',
  land: 'Terreno / Lote',
  estate: 'Finca / Quinta',
  studio: 'Suite / Estudio',
  penthouse: 'Ático / Penthouse',
  townhouse: 'Casa en conjunto',
  commercial: 'Local comercial',
  office: 'Oficina',
  villa: 'Villa',
  loft: 'Loft',
};

export const typeLabelEn: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  land: 'Land / Lot',
  estate: 'Estate / Country property',
  studio: 'Studio / Suite',
  penthouse: 'Penthouse',
  townhouse: 'Townhouse',
  commercial: 'Commercial space',
  office: 'Office',
  villa: 'Villa',
  loft: 'Loft',
};

export function getTypeLabel(type: string, lang: Language = 'es'): string {
  if (lang === 'es') return typeLabelEs[type] || type;
  return typeLabelEn[type] || type;
}

export const statusLabel = statusLabelEs;
export const typeLabel = typeLabelEs;
