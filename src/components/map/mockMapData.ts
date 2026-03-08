export type UiCategory = 'music' | 'party' | 'sports' | 'art' | 'market' | 'parche';

export type UiAlertType =
  | 'police_presence'
  | 'road_closure'
  | 'venue_full'
  | 'public_disorder'
  | 'heavy_rain'
  | 'parking_full'
  | 'checkpoint'
  | 'all_clear'
  | 'tickets_at_door'
  | 'artist_on_stage'
  | 'schedule_change';

export interface MapEvent {
  id: string;
  title: string;
  category: UiCategory;
  status: 'live' | 'approved';
  coordinates: [number, number];
  description: string;
  placeName: string;
  startsLabel: string;
  tags: string[];
  photos: string[];
  organizer: string;
  organizerVerified: boolean;
  adultsOnly: boolean;
  allowsMinors: boolean;
  petFriendly: boolean;
  bikeSkateFriendly: boolean;
}

export interface MapPlace {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  tags: string[];
  photos: string[];
  alerts: UiAlertType[];
  adultsOnly: boolean;
  allowsMinors: boolean;
  petFriendly: boolean;
  bikeSkateFriendly: boolean;
}

export interface MapAlert {
  id: string;
  type: UiAlertType;
  message: string;
  coordinates: [number, number];
  expiresAt: string;
}

export interface MapComment {
  id: string;
  author: string;
  avatarSeed: string;
  content: string;
  relativeTime: string;
}

const baseIso = new Date();

export const mapEvents: MapEvent[] = [
  {
    id: 'event-1',
    title: 'Rumba en El Poblado',
    category: 'party',
    status: 'live',
    coordinates: [-75.5674, 6.2099],
    description: 'DJ set urbano, zona de food trucks y ambiente de noche en El Poblado.',
    placeName: 'Parque El Poblado',
    startsLabel: 'EN VIVO',
    tags: ['Metro cerca', 'Mascotas', '18+', 'Skate friendly', 'Zona fumadores'],
    photos: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1200&q=80',
    ],
    organizer: 'Poblado Nights',
    organizerVerified: true,
    adultsOnly: true,
    allowsMinors: false,
    petFriendly: true,
    bikeSkateFriendly: true,
  },
  {
    id: 'event-2',
    title: 'Skate Session Parque Explora',
    category: 'sports',
    status: 'approved',
    coordinates: [-75.5676, 6.2701],
    description: 'Sesion abierta con retos, musica y punto de hidratacion para riders.',
    placeName: 'Parque Explora',
    startsLabel: 'Hoy 8:00 pm',
    tags: ['Skate park', 'Entrada libre', 'Pet friendly', 'Menores permitidos'],
    photos: [
      'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&w=1200&q=80',
    ],
    organizer: 'Explora Crew',
    organizerVerified: false,
    adultsOnly: false,
    allowsMinors: true,
    petFriendly: true,
    bikeSkateFriendly: true,
  },
  {
    id: 'event-3',
    title: 'Mercado Artesanal Plaza Botero',
    category: 'market',
    status: 'live',
    coordinates: [-75.5685, 6.2518],
    description: 'Artesanias locales, musica en vivo y talleres de pintura para toda la tarde.',
    placeName: 'Plaza Botero',
    startsLabel: 'EN VIVO',
    tags: ['Economico', 'Familiar', 'Centro', 'Acceso metro'],
    photos: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    ],
    organizer: 'Colectivo Artes Medellin',
    organizerVerified: true,
    adultsOnly: false,
    allowsMinors: true,
    petFriendly: false,
    bikeSkateFriendly: false,
  },
  {
    id: 'event-4',
    title: 'Concierto La 70',
    category: 'music',
    status: 'live',
    coordinates: [-75.5847, 6.2349],
    description: 'Bandas locales en tarima abierta. Alerta de inicio de show por bloques.',
    placeName: 'Corredor La 70',
    startsLabel: 'EN VIVO',
    tags: ['Musica en vivo', 'Zona segura', 'Bares', 'Transporte facil'],
    photos: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    ],
    organizer: 'La 70 Live',
    organizerVerified: true,
    adultsOnly: true,
    allowsMinors: false,
    petFriendly: false,
    bikeSkateFriendly: false,
  },
  {
    id: 'event-5',
    title: 'Parche Cerro Nutibara',
    category: 'party',
    status: 'approved',
    coordinates: [-75.594, 6.2346],
    description: 'Encuentro sunset con vista panoramica y sets de house al aire libre.',
    placeName: 'Cerro Nutibara',
    startsLabel: 'Manana',
    tags: ['Vista ciudad', 'Open air', 'Parqueadero limitado', 'Bici friendly'],
    photos: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    ],
    organizer: 'Sunset Nutibara',
    organizerVerified: false,
    adultsOnly: false,
    allowsMinors: true,
    petFriendly: true,
    bikeSkateFriendly: true,
  },
];

export const mapPlaces: MapPlace[] = [
  {
    id: 'place-1',
    name: 'Parque de los Deseos',
    coordinates: [-75.5668, 6.2696],
    description: 'Lugar permanente para parches culturales y activaciones nocturnas.',
    tags: ['Metro', 'Pet friendly', 'Zona amplia', 'Plan familiar'],
    photos: ['https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'],
    alerts: ['all_clear'],
    adultsOnly: false,
    allowsMinors: true,
    petFriendly: true,
    bikeSkateFriendly: true,
  },
  {
    id: 'place-2',
    name: 'Ciudad del Rio',
    coordinates: [-75.5678, 6.2204],
    description: 'Punto fijo para skate, bici y mercado los fines de semana.',
    tags: ['Skate', 'Bici', 'Parque', 'Zona familiar'],
    photos: ['https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&w=1200&q=80'],
    alerts: ['tickets_at_door'],
    adultsOnly: false,
    allowsMinors: true,
    petFriendly: true,
    bikeSkateFriendly: true,
  },
];

export const mapAlerts: MapAlert[] = [
  {
    id: 'alert-1',
    type: 'police_presence',
    message: 'Presencia de policia en la esquina principal.',
    coordinates: [-75.568, 6.21],
    expiresAt: new Date(baseIso.getTime() + 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'alert-2',
    type: 'artist_on_stage',
    message: 'El artista principal ya esta en tarima.',
    coordinates: [-75.5847, 6.2349],
    expiresAt: new Date(baseIso.getTime() + 1000 * 60 * 24).toISOString(),
  },
  {
    id: 'alert-3',
    type: 'all_clear',
    message: 'Flujo normal, acceso sin novedades.',
    coordinates: [-75.5676, 6.2701],
    expiresAt: new Date(baseIso.getTime() + 1000 * 60 * 32).toISOString(),
  },
];

export const demoComments: MapComment[] = [
  { id: 'c1', author: 'Ana R', avatarSeed: 'ana', content: 'Buen ambiente, lleguen temprano.', relativeTime: 'hace 10 min' },
  { id: 'c2', author: 'Pipe M', avatarSeed: 'pipe', content: 'La fila esta rapida, todo bien.', relativeTime: 'hace 18 min' },
  { id: 'c3', author: 'Vale G', avatarSeed: 'vale', content: 'Hay zona para sentarse cerca al escenario.', relativeTime: 'hace 26 min' },
  { id: 'c4', author: 'Camilo T', avatarSeed: 'camilo', content: 'Traigan chaqueta, esta lloviznando.', relativeTime: 'hace 41 min' },
  { id: 'c5', author: 'Lina S', avatarSeed: 'lina', content: 'El sonido esta brutal en la tarima principal.', relativeTime: 'hace 53 min' },
  { id: 'c6', author: 'Sara C', avatarSeed: 'sara', content: 'Se consigue parqueo a dos cuadras.', relativeTime: 'hace 1 h' },
];

export const categoryEmoji: Record<UiCategory, string> = {
  music: '🎵',
  party: '🎉',
  sports: '🛹',
  art: '🎨',
  market: '🧺',
  parche: '🍺',
};

export const alertMeta: Record<UiAlertType, { emoji: string; color: string; label: string; pulse?: boolean }> = {
  police_presence: { emoji: '🚔', color: '#EF4444', label: 'Policia' },
  road_closure: { emoji: '🚧', color: '#F59E0B', label: 'Via cerrada' },
  venue_full: { emoji: '🔴', color: '#991B1B', label: 'Lugar lleno' },
  public_disorder: { emoji: '⚠️', color: '#F97316', label: 'Pelea' },
  heavy_rain: { emoji: '🌧️', color: '#3B82F6', label: 'Lluvia fuerte' },
  parking_full: { emoji: '🅿️', color: '#8B5CF6', label: 'Parqueo lleno' },
  checkpoint: { emoji: '🛑', color: '#EF4444', label: 'Reten' },
  all_clear: { emoji: '✅', color: '#22C55E', label: 'Todo bien' },
  tickets_at_door: { emoji: '🎟️', color: '#86EFAC', label: 'Boletas en puerta' },
  artist_on_stage: { emoji: '🎸', color: '#F97316', label: 'Artista en tarima', pulse: true },
  schedule_change: { emoji: '🕐', color: '#F59E0B', label: 'Cambio de horario' },
};
