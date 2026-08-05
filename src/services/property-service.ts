import type { Paginated, Property, PropertyFilters, SortKey } from '@/types';
import { properties } from '@/data/properties';
import { PER_PAGE } from '@/constants/site';

/**
 * The only module that knows where listings come from.
 * Replace the array lookups with fetch calls and the rest of the app is unchanged.
 */

const sorters: Record<SortKey, (a: Property, b: Property) => number> = {
  newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'area-desc': (a, b) => b.area - a.area,
  'bedrooms-desc': (a, b) => b.bedrooms - a.bedrooms,
  popular: (a, b) => b.views - a.views,
};

export function matchesFilters(property: Property, filters: PropertyFilters) {
  const {
    q,
    status,
    types,
    citySlug,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    amenities,
    garages,
    featuredOnly,
  } = filters;

  if (q) {
    const haystack = `${property.title} ${property.address} ${property.reference} ${property.type}`.toLowerCase();
    if (!haystack.includes(q.toLowerCase())) return false;
  }
  if (status && status !== 'all' && property.status !== status) return false;
  if (types?.length && !types.includes(property.type)) return false;
  if (citySlug && property.citySlug !== citySlug) return false;
  if (minPrice != null && property.price < minPrice) return false;
  if (maxPrice != null && property.price > maxPrice) return false;
  if (bedrooms != null && property.bedrooms < bedrooms) return false;
  if (bathrooms != null && property.bathrooms < bathrooms) return false;
  if (minArea != null && property.area < minArea) return false;
  if (maxArea != null && property.area > maxArea) return false;
  if (garages != null && property.garages < garages) return false;
  if (featuredOnly && !property.featured) return false;
  if (amenities?.length && !amenities.every((id) => property.amenityIds.includes(id))) return false;
  return true;
}

export function searchProperties(filters: PropertyFilters = {}): Paginated<Property> {
  const perPage = filters.perPage ?? PER_PAGE;
  const page = Math.max(filters.page ?? 1, 1);
  const filtered = properties
    .filter((property) => matchesFilters(property, filters))
    .sort(sorters[filters.sort ?? 'newest']);

  const totalPages = Math.max(Math.ceil(filtered.length / perPage), 1);
  const safePage = Math.min(page, totalPages);

  return {
    items: filtered.slice((safePage - 1) * perPage, safePage * perPage),
    total: filtered.length,
    page: safePage,
    perPage,
    totalPages,
  };
}

/** Full result set without pagination — used by the map view. */
export function searchAll(filters: PropertyFilters = {}) {
  return properties
    .filter((property) => matchesFilters(property, filters))
    .sort(sorters[filters.sort ?? 'newest']);
}

export function getSimilar(property: Property, limit = 3) {
  return properties
    .filter((item) => item.id !== property.id)
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

export function getPropertiesByIds(ids: string[]) {
  return ids
    .map((id) => properties.find((property) => property.id === id))
    .filter((property): property is Property => Boolean(property));
}

export function getPropertiesByAgent(agentId: string) {
  return properties.filter((property) => property.agentId === agentId);
}

export function getFacets() {
  const priceValues = properties.map((property) => property.price);
  return {
    minPrice: Math.min(...priceValues),
    maxPrice: Math.max(...priceValues),
    total: properties.length,
    byCity: properties.reduce<Record<string, number>>((acc, property) => {
      acc[property.citySlug] = (acc[property.citySlug] ?? 0) + 1;
      return acc;
    }, {}),
    byType: properties.reduce<Record<string, number>>((acc, property) => {
      acc[property.type] = (acc[property.type] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
