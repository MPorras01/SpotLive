import { create } from 'zustand';
import type { EventCategory, EventStatus } from '@spotlive/types';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface MapStore {
  viewport: MapViewport;
  searchTerm: string;
  selectedStatuses: EventStatus[];
  selectedCategory: EventCategory | 'all';
  showAlerts: boolean;
  setViewport: (viewport: MapViewport) => void;
  setSearchTerm: (value: string) => void;
  toggleStatus: (status: EventStatus) => void;
  setSelectedCategory: (category: EventCategory | 'all') => void;
  setShowAlerts: (value: boolean) => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: {
    latitude: 6.2518,
    longitude: -75.5636,
    zoom: 12,
  },
  searchTerm: '',
  selectedStatuses: ['live', 'approved', 'pending'],
  selectedCategory: 'all',
  showAlerts: true,
  setViewport: (viewport) => set({ viewport }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  toggleStatus: (status) =>
    set((state) => ({
      selectedStatuses: state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter((item) => item !== status)
        : [...state.selectedStatuses, status],
    })),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setShowAlerts: (showAlerts) => set({ showAlerts }),
  resetFilters: () =>
    set({
      searchTerm: '',
      selectedStatuses: ['live', 'approved', 'pending'],
      selectedCategory: 'all',
      showAlerts: true,
    }),
}));
