'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_COMPARE = 4;
const MAX_RECENT = 8;

interface CollectionsState {
  favorites: string[];
  compare: string[];
  recent: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleCompare: (id: string) => 'added' | 'removed' | 'full';
  clearCompare: () => void;
  pushRecent: (id: string) => void;
  clearFavorites: () => void;
}

/**
 * Favourites, comparisons and recently viewed homes.
 * Persisted to local storage — no account, nothing leaves the device.
 */
export const useCollections = create<CollectionsState>()(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      recent: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [id, ...state.favorites],
        })),
      isFavorite: (id) => get().favorites.includes(id),
      toggleCompare: (id) => {
        const { compare } = get();
        if (compare.includes(id)) {
          set({ compare: compare.filter((item) => item !== id) });
          return 'removed';
        }
        if (compare.length >= MAX_COMPARE) return 'full';
        set({ compare: [...compare, id] });
        return 'added';
      },
      clearCompare: () => set({ compare: [] }),
      clearFavorites: () => set({ favorites: [] }),
      pushRecent: (id) =>
        set((state) => ({
          recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, MAX_RECENT),
        })),
    }),
    { name: 'vestra:collections', version: 1 },
  ),
);
