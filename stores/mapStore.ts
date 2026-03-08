import { create } from 'zustand';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface MapStore {
  viewport: MapViewport;
  searchTerm: string;
  showAlerts: boolean;
  setViewport: (viewport: MapViewport) => void;
  setSearchTerm: (value: string) => void;
  setShowAlerts: (value: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: {
    latitude: 6.2518,
    longitude: -75.5636,
    zoom: 12,
  },
  searchTerm: '',
  showAlerts: true,
  setViewport: (viewport) => set({ viewport }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setShowAlerts: (showAlerts) => set({ showAlerts }),
}));
