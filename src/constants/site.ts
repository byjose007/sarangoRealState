export const siteConfig = {
  name: 'Sarango Real Estate',
  legalName: 'Sarango Real Estate LLC',
  tagline: 'Homes measured, not marketed.',
  description:
    'Sarango Real Estate es una agencia inmobiliaria boutique. Cada propiedad se mide, dibuja y documenta antes de llegar al mercado.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'es-EC',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+593 98 672 6084',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '593986726084',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'jasarangoguaillas69@gmail.com',
  hours: 'Lun – Vie · 9:00 – 18:00',
  founded: 2024,
  offices: [
    {
      city: 'Cuenca',
      address:
        'Edificio Alameda 1, Local número 4, calles José Astudillo Regalado, Cuenca, Ecuador',
      phone: '+593 98 672 6084',
      coordinates: { lat: -2.9001, lng: -79.0059 },
    },
  ],
  social: {
    tiktok: 'https://www.tiktok.com/@josesarango695?_r=1&_t=ZS-98bPoOtmY6R',
    instagram: 'https://www.instagram.com/josestalinsarangoguaillas',
    facebook: 'https://www.facebook.com/people/Sarango-Real-Estate/61562774117839/',
  },
} as const;

export const mapConfig = {
  provider: (process.env.NEXT_PUBLIC_MAP_PROVIDER ?? 'openstreetmap') as
    'openstreetmap' | 'static' | 'google' | 'mapbox',
  googleKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ?? '',
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '',
};

export const PER_PAGE = 9;
