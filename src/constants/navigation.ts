import type { PropertyType } from '@/types';
import type { TranslationDictionary } from '@/i18n/types';

export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  /** Renders as the wide mega-menu instead of a simple dropdown. */
  mega?: boolean;
}

export function getMainNav(t?: TranslationDictionary): NavItem[] {
  if (!t) return mainNav;
  return [
    {
      label: t.nav.buy,
      href: '/properties?status=for-sale',
      mega: true,
      children: [
        { label: t.nav.allHomesForSale, href: '/properties?status=for-sale', description: t.nav.allHomesForSaleDesc },
        { label: t.nav.newDevelopments, href: '/properties?status=new-development', description: t.nav.newDevelopmentsDesc },
        { label: t.nav.villasAndEstates, href: '/properties?types=villa', description: t.nav.villasAndEstatesDesc },
        { label: t.nav.penthouses, href: '/properties?types=penthouse', description: t.nav.penthousesDesc },
        { label: t.nav.compareListings, href: '/compare', description: t.nav.compareListingsDesc },
        { label: t.nav.savedHomes, href: '/favorites', description: t.nav.savedHomesDesc },
      ],
    },
    {
      label: t.nav.rent,
      href: '/properties?status=for-rent',
      children: [
        { label: t.nav.longTermRentals, href: '/properties?status=for-rent' },
        { label: t.nav.furnishedApartments, href: '/properties?status=for-rent&types=apartment' },
        { label: t.nav.lofts, href: '/properties?types=loft' },
      ],
    },
    {
      label: t.nav.agents,
      href: '/agents',
    },
    {
      label: t.nav.journal,
      href: '/blog',
      children: [
        { label: t.nav.marketReports, href: '/blog?category=market' },
        { label: t.nav.buyingGuides, href: '/blog?category=buying' },
        { label: t.nav.investment, href: '/blog?category=investment' },
        { label: t.nav.design, href: '/blog?category=design' },
      ],
    },
    {
      label: t.nav.studio,
      href: '/about',
      children: [
        { label: t.nav.aboutVestra, href: '/about' },
        { label: t.nav.contact, href: '/contact' },
      ],
    },
  ];
}

export function getFooterNav(t?: TranslationDictionary) {
  if (!t) return footerNav;
  return [
    {
      title: t.footer.browse,
      links: [
        { label: t.property.forSale, href: '/properties?status=for-sale' },
        { label: t.property.forRent, href: '/properties?status=for-rent' },
        { label: t.property.newDevelopment, href: '/properties?status=new-development' },
        { label: t.nav.compareListings, href: '/compare' },
        { label: t.nav.savedHomes, href: '/favorites' },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { label: t.footer.about, href: '/about' },
        { label: t.footer.ourAgents, href: '/agents' },
        { label: t.nav.journal, href: '/blog' },
        { label: t.nav.contact, href: '/contact' },
        { label: t.footer.comingSoon, href: '/coming-soon' },
      ],
    },
    {
      title: t.footer.resources,
      links: [
        { label: t.footer.mortgageCalculator, href: '/properties' },
        { label: t.footer.buyerGuide, href: '/blog?category=buying' },
        { label: t.nav.marketReports, href: '/blog?category=market' },
        { label: t.footer.investmentDesk, href: '/blog?category=investment' },
      ],
    },
  ];
}

export function getPropertyTypeOptions(t?: TranslationDictionary): { value: PropertyType; label: string }[] {
  if (!t) return propertyTypeOptions;
  return [
    { value: 'villa', label: t.property.types.villa },
    { value: 'apartment', label: t.property.types.apartment },
    { value: 'townhouse', label: t.property.types.townhouse },
    { value: 'penthouse', label: t.property.types.penthouse },
    { value: 'loft', label: t.property.types.loft },
    { value: 'estate', label: t.property.types.estate },
    { value: 'office', label: t.property.types.office },
  ];
}

export function getSortOptions(t?: TranslationDictionary) {
  if (!t) return sortOptions;
  return [
    { value: 'newest', label: t.property.sort.newest },
    { value: 'price-asc', label: t.property.sort.priceAsc },
    { value: 'price-desc', label: t.property.sort.priceDesc },
    { value: 'area-desc', label: t.property.sort.areaDesc },
    { value: 'bedrooms-desc', label: t.property.sort.bedroomsDesc },
    { value: 'popular', label: t.property.sort.popular },
  ] as const;
}

export const mainNav: NavItem[] = [
  {
    label: 'Comprar',
    href: '/properties?status=for-sale',
    mega: true,
    children: [
      { label: 'Todas las viviendas en venta', href: '/properties?status=for-sale', description: 'Cada propiedad verificada y documentada en el mercado' },
      { label: 'Obra nueva', href: '/properties?status=new-development', description: 'En construcción y primeros lanzamientos' },
      { label: 'Villas y fincas', href: '/properties?types=villa', description: 'Casas unifamiliares con amplia parcela' },
      { label: 'Áticos', href: '/properties?types=penthouse', description: 'Residencias en planta alta con terrazas' },
      { label: 'Comparar propiedades', href: '/compare', description: 'Compara hasta cuatro viviendas cara a cara' },
      { label: 'Viviendas guardadas', href: '/favorites', description: 'Tu lista de favoritos guardada en este dispositivo' },
    ],
  },
  {
    label: 'Alquilar',
    href: '/properties?status=for-rent',
    children: [
      { label: 'Alquiler de larga estancia', href: '/properties?status=for-rent' },
      { label: 'Apartamentos amueblados', href: '/properties?status=for-rent&types=apartment' },
      { label: 'Lofts', href: '/properties?types=loft' },
    ],
  },
  {
    label: 'Agentes',
    href: '/agents',
  },
  {
    label: 'Revista',
    href: '/blog',
    children: [
      { label: 'Informes de mercado', href: '/blog?category=market' },
      { label: 'Guías de compra', href: '/blog?category=buying' },
      { label: 'Inversión', href: '/blog?category=investment' },
      { label: 'Diseño y arquitectura', href: '/blog?category=design' },
    ],
  },
  {
    label: 'Estudio',
    href: '/about',
    children: [
      { label: 'Sobre Vestra', href: '/about' },
      { label: 'Contacto', href: '/contact' },
    ],
  },
];

export const footerNav = [
  {
    title: 'Explorar',
    links: [
      { label: 'En venta', href: '/properties?status=for-sale' },
      { label: 'En alquiler', href: '/properties?status=for-rent' },
      { label: 'Obra nueva', href: '/properties?status=new-development' },
      { label: 'Comparar propiedades', href: '/compare' },
      { label: 'Viviendas guardadas', href: '/favorites' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Nosotros', href: '/about' },
      { label: 'Nuestros agentes', href: '/agents' },
      { label: 'Revista', href: '/blog' },
      { label: 'Contacto', href: '/contact' },
      { label: 'Próximamente', href: '/coming-soon' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Calculadora de hipotecas', href: '/properties' },
      { label: 'Guía del comprador', href: '/blog?category=buying' },
      { label: 'Informes de mercado', href: '/blog?category=market' },
      { label: 'Mesa de inversión', href: '/blog?category=investment' },
    ],
  },
];

export const propertyTypeOptions: { value: PropertyType; label: string }[] = [
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'townhouse', label: 'Adosado' },
  { value: 'penthouse', label: 'Ático' },
  { value: 'loft', label: 'Loft' },
  { value: 'estate', label: 'Finca' },
  { value: 'office', label: 'Oficina' },
];

export const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'area-desc', label: 'Mayor superficie' },
  { value: 'bedrooms-desc', label: 'Más dormitorios' },
  { value: 'popular', label: 'Más visitadas' },
] as const;
