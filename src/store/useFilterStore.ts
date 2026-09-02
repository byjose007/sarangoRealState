import { create } from 'zustand';
import type { PropertyFilters, ListingStatus, PropertyType, SortKey } from '@/types';

interface FilterState {
  filters: PropertyFilters;
  setFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: PropertyFilters = {
  q: '',
  status: 'all',
  types: [],
  citySlug: '',
  minPrice: undefined,
  maxPrice: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  minArea: undefined,
  maxArea: undefined,
  amenities: [],
  garages: undefined,
  featuredOnly: false,
  sort: 'newest',
  page: 1,
  perPage: 9,
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        // Reset to page 1 whenever filters change (unless updating page itself)
        ...(key !== 'page' ? { page: 1 } : {}),
      },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page: newFilters.page ?? 1,
      },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
