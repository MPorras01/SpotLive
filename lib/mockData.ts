export interface MobileEventItem {
  id: string;
  title: string;
  placeName: string;
  category: 'music' | 'party' | 'sports' | 'art' | 'market' | 'food' | 'other';
  status: 'pending' | 'approved' | 'live' | 'finished' | 'rejected';
  startAt: string;
  coordinate: [number, number];
}

export interface MobileAlertItem {
  id: string;
  message: string;
  type: 'parking_full' | 'road_closure' | 'all_clear';
  coordinate: [number, number];
}

const now = Date.now();

export const demoMobileEvents: MobileEventItem[] = [
  {
    id: 'event-1',
    title: 'Sunset DJ Session',
    placeName: 'Parque El Poblado',
    category: 'music',
    status: 'live',
    startAt: new Date(now - 20 * 60_000).toISOString(),
    coordinate: [-75.5674, 6.2099],
  },
  {
    id: 'event-2',
    title: 'Mercado Nocturno Creativo',
    placeName: 'Plaza Botero',
    category: 'market',
    status: 'approved',
    startAt: new Date(now + 60 * 60_000).toISOString(),
    coordinate: [-75.5685, 6.2518],
  },
  {
    id: 'event-3',
    title: 'Cine al Parque',
    placeName: 'Jardin Botanico',
    category: 'art',
    status: 'pending',
    startAt: new Date(now + 24 * 60 * 60_000).toISOString(),
    coordinate: [-75.5712, 6.2682],
  },
];

export const demoMobileAlerts: MobileAlertItem[] = [
  {
    id: 'alert-1',
    message: 'Parqueadero principal lleno.',
    type: 'parking_full',
    coordinate: [-75.5674, 6.2099],
  },
  {
    id: 'alert-2',
    message: 'Cierre temporal por montaje de tarima.',
    type: 'road_closure',
    coordinate: [-75.5685, 6.2518],
  },
];
