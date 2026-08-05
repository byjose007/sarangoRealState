import type { Coordinates, Property } from '@/types';

/** Serialisable marker shape — safe to build on the server and pass to the map. */
export interface MapPoint {
  id: string;
  slug: string;
  label: string;
  price: number;
  period: 'month' | 'total';
  coordinates: Coordinates;
}

export const toMapPoint = (property: Property): MapPoint => ({
  id: property.id,
  slug: property.slug,
  label: property.title,
  price: property.price,
  period: property.pricePeriod,
  coordinates: property.coordinates,
});
