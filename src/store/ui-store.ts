'use client';

import { create } from 'zustand';

interface UiState {
  mobileNavOpen: boolean;
  filtersOpen: boolean;
  quickViewId: string | null;
  setMobileNav: (open: boolean) => void;
  setFilters: (open: boolean) => void;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
}

export const useUi = create<UiState>((set) => ({
  mobileNavOpen: false,
  filtersOpen: false,
  quickViewId: null,
  setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),
  setFilters: (filtersOpen) => set({ filtersOpen }),
  openQuickView: (quickViewId) => set({ quickViewId }),
  closeQuickView: () => set({ quickViewId: null }),
}));
