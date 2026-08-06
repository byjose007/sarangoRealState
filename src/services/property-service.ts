import type { Paginated, Property, PropertyFilters, SortKey } from '@/types';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { PER_PAGE } from '@/constants/site';
import { safeBuildTimeFetch } from '@/lib/safe-build-fetch';

/**
 * The only module that knows properties live in Postgres now. Every export
 * keeps the signature it had when this was an in-memory array lookup — see
 * README "Decisions worth knowing" — so no consuming component changed
 * shape, only sync -> async.
 */

const STATUS_TO_PRISMA = {
  'for-sale': 'FOR_SALE',
  'for-rent': 'FOR_RENT',
  sold: 'SOLD',
  'new-development': 'NEW_DEVELOPMENT',
} as const;

const STATUS_TO_FRONTEND: Record<string, Property['status']> = {
  FOR_SALE: 'for-sale',
  FOR_RENT: 'for-rent',
  SOLD: 'sold',
  NEW_DEVELOPMENT: 'new-development',
};

const TYPE_TO_PRISMA = {
  villa: 'VILLA',
  apartment: 'APARTMENT',
  townhouse: 'TOWNHOUSE',
  penthouse: 'PENTHOUSE',
  loft: 'LOFT',
  estate: 'ESTATE',
  office: 'OFFICE',
} as const;

const TYPE_TO_FRONTEND: Record<string, Property['type']> = {
  VILLA: 'villa',
  APARTMENT: 'apartment',
  TOWNHOUSE: 'townhouse',
  PENTHOUSE: 'penthouse',
  LOFT: 'loft',
  ESTATE: 'estate',
  OFFICE: 'office',
};

const PRICE_PERIOD_TO_FRONTEND: Record<string, Property['pricePeriod']> = {
  MONTH: 'month',
  TOTAL: 'total',
};

const PROPERTY_INCLUDE = {
  images: { orderBy: { position: 'asc' as const } },
  floorPlans: true,
  documents: true,
} satisfies Prisma.PropertyInclude;

type PropertyRow = Prisma.PropertyGetPayload<{ include: typeof PROPERTY_INCLUDE }>;

function mapProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    reference: row.reference,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: STATUS_TO_FRONTEND[row.status] ?? 'for-sale',
    type: TYPE_TO_FRONTEND[row.type] ?? 'villa',
    price: row.price,
    pricePeriod: PRICE_PERIOD_TO_FRONTEND[row.pricePeriod] ?? 'total',
    address: row.address,
    citySlug: row.citySlug,
    coordinates: { lat: row.lat, lng: row.lng },
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    garages: row.garages,
    area: row.area,
    landArea: row.landArea,
    yearBuilt: row.yearBuilt ?? 0,
    energyRating: (row.energyRating ?? 'C') as Property['energyRating'],
    featured: row.featured,
    images: row.images.map((image) => image.url),
    amenityIds: row.amenityIds,
    floorPlans: row.floorPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      level: plan.level,
      area: plan.area,
      bedrooms: plan.bedrooms,
      bathrooms: plan.bathrooms,
      outline: plan.outline,
      rooms: plan.rooms as { name: string; x: number; y: number }[],
    })),
    documents: row.documents.map((document) => ({
      id: document.id,
      name: document.name,
      type: document.type.toLowerCase() as 'pdf' | 'dwg' | 'zip',
      size: document.size,
      href: document.href,
    })),
    videoUrl: row.videoUrl ?? undefined,
    tourUrl: row.tourUrl ?? undefined,
    agentId: row.agentId,
    createdAt: row.createdAt.toISOString(),
    views: row.views,
    hoaFee: row.hoaFee ?? undefined,
    propertyTax: row.propertyTax,
    nearby: row.nearby as { label: string; distance: number }[],
  };
}

const ACTIVE = { deletedAt: null } as const;

function buildWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { ...ACTIVE };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { address: { contains: filters.q, mode: 'insensitive' } },
      { reference: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.status && filters.status !== 'all') {
    where.status = STATUS_TO_PRISMA[filters.status];
  }
  if (filters.types?.length) {
    where.type = { in: filters.types.map((type) => TYPE_TO_PRISMA[type]) };
  }
  if (filters.citySlug) where.citySlug = filters.citySlug;
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.bedrooms != null) where.bedrooms = { gte: filters.bedrooms };
  if (filters.bathrooms != null) where.bathrooms = { gte: filters.bathrooms };
  if (filters.minArea != null || filters.maxArea != null) {
    where.area = {
      ...(filters.minArea != null ? { gte: filters.minArea } : {}),
      ...(filters.maxArea != null ? { lte: filters.maxArea } : {}),
    };
  }
  if (filters.garages != null) where.garages = { gte: filters.garages };
  if (filters.featuredOnly) where.featured = true;
  if (filters.amenities?.length) where.amenityIds = { hasEvery: filters.amenities };

  return where;
}

const ORDER_BY: Record<SortKey, Prisma.PropertyOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  'price-asc': { price: 'asc' },
  'price-desc': { price: 'desc' },
  'area-desc': { area: 'desc' },
  'bedrooms-desc': { bedrooms: 'desc' },
  popular: { views: 'desc' },
};

export async function searchProperties(filters: PropertyFilters = {}): Promise<Paginated<Property>> {
  const perPage = filters.perPage ?? PER_PAGE;
  const page = Math.max(filters.page ?? 1, 1);
  const where = buildWhere(filters);
  const orderBy = ORDER_BY[filters.sort ?? 'newest'];

  const total = await prisma.property.count({ where });
  const totalPages = Math.max(Math.ceil(total / perPage), 1);
  const safePage = Math.min(page, totalPages);

  const rows = await prisma.property.findMany({
    where,
    orderBy,
    skip: (safePage - 1) * perPage,
    take: perPage,
    include: PROPERTY_INCLUDE,
  });

  return {
    items: rows.map(mapProperty),
    total,
    page: safePage,
    perPage,
    totalPages,
  };
}

/** Full result set without pagination — used by the map view. */
export async function searchAll(filters: PropertyFilters = {}): Promise<Property[]> {
  const rows = await prisma.property.findMany({
    where: buildWhere(filters),
    orderBy: ORDER_BY[filters.sort ?? 'newest'],
    include: PROPERTY_INCLUDE,
  });
  return rows.map(mapProperty);
}

export async function getSimilar(property: Property, limit = 3): Promise<Property[]> {
  const rows = await prisma.property.findMany({
    where: { ...ACTIVE, id: { not: property.id } },
    include: PROPERTY_INCLUDE,
  });

  return rows
    .map(mapProperty)
    .map((item) => {
      let score = 0;
      if (item.citySlug === property.citySlug) score += 3;
      if (item.type === property.type) score += 2;
      if (item.status === property.status) score += 2;
      score -= Math.abs(item.price - property.price) / Math.max(property.price, 1);
      score -= Math.abs(item.bedrooms - property.bedrooms) * 0.4;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

/** Preserves the order of `ids` — callers (recently viewed, compare) rely on it. */
export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];
  const rows = await prisma.property.findMany({
    where: { id: { in: ids }, ...ACTIVE },
    include: PROPERTY_INCLUDE,
  });
  const byId = new Map(rows.map(mapProperty).map((property) => [property.id, property]));
  return ids.map((id) => byId.get(id)).filter((property): property is Property => Boolean(property));
}

export async function getPropertiesByAgent(agentId: string): Promise<Property[]> {
  const rows = await prisma.property.findMany({
    where: { agentId, ...ACTIVE },
    include: PROPERTY_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapProperty);
}

const EMPTY_FACETS = { minPrice: 0, maxPrice: 0, total: 0, byCity: {}, byType: {} } as const;

/** Called from the (statically-generated) home and /properties pages — see safeBuildTimeFetch. */
export async function getFacets() {
  return safeBuildTimeFetch(
    async () => {
      const [priceAgg, total, byCity, byType] = await Promise.all([
        prisma.property.aggregate({ where: ACTIVE, _min: { price: true }, _max: { price: true } }),
        prisma.property.count({ where: ACTIVE }),
        prisma.property.groupBy({ by: ['citySlug'], where: ACTIVE, _count: { _all: true } }),
        prisma.property.groupBy({ by: ['type'], where: ACTIVE, _count: { _all: true } }),
      ]);

      return {
        minPrice: priceAgg._min.price ?? 0,
        maxPrice: priceAgg._max.price ?? 0,
        total,
        byCity: Object.fromEntries(byCity.map((row) => [row.citySlug, row._count._all])),
        byType: Object.fromEntries(byType.map((row) => [TYPE_TO_FRONTEND[row.type] ?? row.type, row._count._all])),
      };
    },
    EMPTY_FACETS,
    'getFacets',
  );
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const row = await prisma.property.findFirst({ where: { slug, ...ACTIVE }, include: PROPERTY_INCLUDE });
  return row ? mapProperty(row) : null;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const row = await prisma.property.findFirst({ where: { id, ...ACTIVE }, include: PROPERTY_INCLUDE });
  return row ? mapProperty(row) : null;
}

/**
 * Only called from generateStaticParams at build time — with no matching
 * static param, Next falls back to on-demand rendering + ISR per-page, so
 * an empty result here just means zero pages are pre-rendered at build time
 * rather than a build failure. See safeBuildTimeFetch.
 */
export async function getAllPropertySlugs(): Promise<string[]> {
  return safeBuildTimeFetch(
    async () => {
      const rows = await prisma.property.findMany({ where: ACTIVE, select: { slug: true } });
      return rows.map((row) => row.slug);
    },
    [],
    'getAllPropertySlugs',
  );
}

/** Called from the (statically-generated) home page — see safeBuildTimeFetch. */
export async function getFeaturedProperties(limit = 9): Promise<Property[]> {
  return safeBuildTimeFetch(
    async () => {
      const rows = await prisma.property.findMany({
        where: { ...ACTIVE, featured: true },
        include: PROPERTY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return rows.map(mapProperty);
    },
    [],
    'getFeaturedProperties',
  );
}

/** Called from the (statically-generated) sitemap.xml route — see safeBuildTimeFetch. */
export async function getPropertiesForSitemap() {
  return safeBuildTimeFetch(
    () => prisma.property.findMany({ where: ACTIVE, select: { slug: true, updatedAt: true } }),
    [],
    'getPropertiesForSitemap',
  );
}
