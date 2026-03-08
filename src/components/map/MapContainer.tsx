'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { AlertChip } from '@/components/map/AlertChip';
import { CategoryBar, type CategoryFilter } from '@/components/map/CategoryBar';
import { EventPin } from '@/components/map/EventPin';
import { MapControls } from '@/components/map/MapControls';
import { alertMeta, mapAlerts, mapEvents, mapPlaces, type MapAlert, type MapEvent, type MapPlace, type UiAlertType } from '@/components/map/mockMapData';
import { AlertSheet } from '@/components/sheets/AlertSheet';
import { CreateEventSheet } from '@/components/sheets/CreateEventSheet';
import { EventSheet } from '@/components/sheets/EventSheet';
import { type FilterState, FilterSheet } from '@/components/sheets/FilterSheet';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { DEFAULT_CENTER, METRO_BOUNDS, TILE_URL } from '@/lib/map/config';

const DARK_TILE_STYLE = 'https://tiles.openfreemap.org/styles/dark';
const RASTER_STREETS_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

function matchesSearch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase().trim());
}

function formatCoordinates(lngLat: maplibregl.LngLat): string {
  return `${lngLat.lat.toFixed(5)}, ${lngLat.lng.toFixed(5)}`;
}

function isMapRuntimeSupported(): boolean {
  const runtime = maplibregl as unknown as { supported?: () => boolean };
  return runtime.supported ? runtime.supported() : true;
}

function projectPosition(map: maplibregl.Map | null, coordinates: [number, number]): { x: number; y: number; visible: boolean } {
  if (!map) {
    return { x: 0, y: 0, visible: false };
  }

  const point = map.project(coordinates);
  const canvas = map.getCanvas();
  const visible = point.x >= -64 && point.y >= -64 && point.x <= canvas.clientWidth + 64 && point.y <= canvas.clientHeight + 64;

  return {
    x: point.x,
    y: point.y,
    visible,
  };
}

export function MapContainer() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);
  const retriedStyleRef = useRef(false);
  const retriedRasterRef = useRef(false);
  const sourceDataReadyRef = useRef(false);
  const mapReadyRef = useRef(false);

  const [mapTick, setMapTick] = useState(0);
  const [mapInstanceKey, setMapInstanceKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapIssue, setMapIssue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [reportPickerOpen, setReportPickerOpen] = useState(false);
  const [alertSheetOpen, setAlertSheetOpen] = useState(false);
  const [createEventSheetOpen, setCreateEventSheetOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedLocationLabel, setPickedLocationLabel] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [alerts, setAlerts] = useState<MapAlert[]>(mapAlerts);
  const [expiringAlertIds, setExpiringAlertIds] = useState<string[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    onlyLive: false,
    onlyAdults: false,
    allowsMinors: false,
    petFriendly: false,
    bikeOrSkate: false,
  });

  useEffect(() => {
    if (!mapCanvasRef.current || mapRef.current) {
      return;
    }

    if (!isMapRuntimeSupported()) {
      setMapIssue('Tu navegador no soporta WebGL para renderizar el mapa.');
      return;
    }

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapCanvasRef.current,
        style: DARK_TILE_STYLE,
        center: DEFAULT_CENTER,
        zoom: 12.6,
        maxBounds: METRO_BOUNDS,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido de inicializacion.';
      // Comentario de negocio: mostramos detalle tecnico para acelerar soporte cuando el mapa no inicia en el navegador del usuario.
      console.error('Map init error:', error);
      setMapIssue(`No se pudo iniciar el motor del mapa (${message}).`);
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-left');

    const sync = () => setMapTick((value) => value + 1);
    map.on('load', sync);
    map.on('idle', () => {
      mapReadyRef.current = true;
      setMapReady(true);
      setMapIssue(null);
      sync();
    });
    map.on('sourcedata', (event) => {
      if (event.isSourceLoaded) {
        sourceDataReadyRef.current = true;
      }
    });
    map.on('move', sync);
    map.on('zoom', sync);
    map.on('resize', sync);
    map.on('error', () => {
      // Comentario de negocio: reintentamos con un estilo alternativo para evitar pantalla blanca en zonas con bloqueos parciales.
      if (!retriedStyleRef.current) {
        retriedStyleRef.current = true;
        map.setStyle(TILE_URL);
        return;
      }

      if (!retriedRasterRef.current) {
        retriedRasterRef.current = true;
        map.setStyle(RASTER_STREETS_STYLE);
        setMapIssue('Usando mapa alternativo para mantener calles visibles.');
        return;
      }

      setMapIssue('No se pudo cargar el estilo de mapa. Verifica conexion y vuelve a intentar.');
    });

    const readinessTimeout = window.setTimeout(() => {
      if (!mapReadyRef.current) {
        if (!sourceDataReadyRef.current && !retriedRasterRef.current) {
          retriedRasterRef.current = true;
          map.setStyle(RASTER_STREETS_STYLE);
          setMapIssue('Cargando mapa alternativo con calles...');
          return;
        }

        setMapIssue('El mapa tarda mas de lo esperado en cargar.');
      }
    }, 9000);

    mapRef.current = map;

    return () => {
      window.clearTimeout(readinessTimeout);
      mapReadyRef.current = false;
      sourceDataReadyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, [mapInstanceKey]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      const nextExpiring = alerts
        .filter((alert) => new Date(alert.expiresAt).getTime() - now <= 20_000)
        .map((alert) => alert.id);

      setExpiringAlertIds(nextExpiring);
      setAlerts((current) => current.filter((alert) => new Date(alert.expiresAt).getTime() > now));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [alerts]);

  const filteredEvents = useMemo(() => {
    return mapEvents.filter((event) => {
      if (filters.onlyLive && event.status !== 'live') {
        return false;
      }

      if (filters.onlyAdults && !event.adultsOnly) {
        return false;
      }

      if (filters.allowsMinors && !event.allowsMinors) {
        return false;
      }

      if (filters.petFriendly && !event.petFriendly) {
        return false;
      }

      if (filters.bikeOrSkate && !event.bikeSkateFriendly) {
        return false;
      }

      if (filters.category !== 'all' && event.category !== filters.category) {
        return false;
      }

      if (categoryFilter === 'live' && event.status !== 'live') {
        return false;
      }

      if (categoryFilter && categoryFilter !== 'live' && categoryFilter !== 'places' && event.category !== categoryFilter) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        return matchesSearch(event.title, searchQuery) || matchesSearch(event.placeName, searchQuery);
      }

      return true;
    });
  }, [categoryFilter, filters, searchQuery]);

  const visiblePlaces = useMemo(() => {
    if (categoryFilter && categoryFilter !== 'places') {
      return [];
    }

    const liveCoords = new Set(filteredEvents.map((event) => event.coordinates.join(',')));
    return mapPlaces.filter((place) => {
      if (liveCoords.has(place.coordinates.join(','))) {
        return false;
      }

      if (filters.onlyAdults && !place.adultsOnly) {
        return false;
      }

      if (filters.allowsMinors && !place.allowsMinors) {
        return false;
      }

      if (filters.petFriendly && !place.petFriendly) {
        return false;
      }

      if (filters.bikeOrSkate && !place.bikeSkateFriendly) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        return matchesSearch(place.name, searchQuery);
      }

      return true;
    });
  }, [categoryFilter, filteredEvents, filters, searchQuery]);

  const visibleAlerts = useMemo(() => {
    return alerts;
  }, [alerts]);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return [];
    }

    const eventResults = filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      subtitle: `Evento • ${event.placeName}`,
      type: 'event' as const,
    }));

    const placeResults = visiblePlaces.map((place) => ({
      id: place.id,
      title: place.name,
      subtitle: 'Lugar',
      type: 'place' as const,
    }));

    return [...eventResults, ...placeResults].slice(0, 8);
  }, [filteredEvents, searchQuery, visiblePlaces]);

  const focusOnCoordinates = (coordinates: [number, number], zoom = 14.5) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.easeTo({
      center: coordinates,
      zoom,
      offset: [0, 140],
      duration: 500,
    });
  };

  const handleSelectEvent = (event: MapEvent) => {
    setSelectedPlace(null);
    setSelectedEvent(event);
    setSheetOpen(true);
    focusOnCoordinates(event.coordinates);
  };

  const handleSelectPlace = (place: MapPlace) => {
    setSelectedEvent(null);
    setSelectedPlace(place);
    setSheetOpen(true);
    focusOnCoordinates(place.coordinates);
  };

  const handleLocateUser = async () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const next: [number, number] = [position.coords.longitude, position.coords.latitude];
      focusOnCoordinates(next, 15);
    });
  };

  const pushUserAlert = (type: UiAlertType) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const center = map.getCenter();
    const id = `alert-user-${Date.now()}`;
    const next: MapAlert = {
      id,
      type,
      message: `${alertMeta[type].label} reportado ahora`,
      coordinates: [center.lng, center.lat],
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    };

    // Comentario de negocio: reflejamos el reporte en tiempo real para mantener la experiencia tipo Waze.
    setAlerts((current) => [next, ...current]);
  };

  return (
    <section className="spot-map-shell fixed inset-0 z-30 h-[100dvh] w-[100vw] overflow-hidden">
      <div className={`spot-map-fallback absolute inset-0 transition-opacity duration-500 ${mapReady ? 'opacity-0' : 'opacity-100'}`} />
      <div ref={mapCanvasRef} className="absolute inset-0" />

      {!mapReady || mapIssue ? (
        <div className="absolute left-1/2 top-4 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs text-white backdrop-blur-md">
          <span>{mapIssue ?? 'Cargando mapa...'}</span>
          {mapIssue ? (
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-white/30 px-2 py-0.5 text-[11px] font-semibold"
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.remove();
                  mapRef.current = null;
                }
                setMapReady(false);
                setMapIssue(null);
                retriedStyleRef.current = false;
                retriedRasterRef.current = false;
                mapReadyRef.current = false;
                sourceDataReadyRef.current = false;
                setMapInstanceKey((value) => value + 1);
              }}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : null}

      <MapControls
        searchQuery={searchQuery}
        searchOpen={searchOpen}
        searchResults={searchResults}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setSearchOpen(true);
        }}
        onSearchFocus={() => setSearchOpen(true)}
        onSearchResult={(id, type) => {
          if (type === 'event') {
            const match = mapEvents.find((event) => event.id === id);
            if (match) {
              handleSelectEvent(match);
            }
          } else {
            const match = mapPlaces.find((place) => place.id === id);
            if (match) {
              handleSelectPlace(match);
            }
          }
          setSearchOpen(false);
        }}
        onOpenFilters={() => setFilterSheetOpen(true)}
        onLocate={handleLocateUser}
        onZoomIn={() => mapRef.current?.zoomIn({ duration: 250 })}
        onZoomOut={() => mapRef.current?.zoomOut({ duration: 250 })}
        onOpenReport={() => setReportPickerOpen(true)}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        {filteredEvents.map((event) => {
          const position = projectPosition(mapRef.current, event.coordinates);
          if (!position.visible) {
            return null;
          }

          return (
            <div
              key={event.id}
              style={{ left: position.x, top: position.y }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              data-map-tick={mapTick}
            >
              <EventPin category={event.category} status={event.status} onClick={() => handleSelectEvent(event)} />
            </div>
          );
        })}

        {visiblePlaces.map((place) => {
          const position = projectPosition(mapRef.current, place.coordinates);
          if (!position.visible) {
            return null;
          }

          return (
            <div
              key={place.id}
              style={{ left: position.x, top: position.y }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-full"
              data-map-tick={mapTick}
            >
              <EventPin variant="place" onClick={() => handleSelectPlace(place)} />
            </div>
          );
        })}

        {visibleAlerts.map((alert) => {
          const position = projectPosition(mapRef.current, alert.coordinates);
          if (!position.visible) {
            return null;
          }

          return (
            <div
              key={alert.id}
              style={{ left: position.x, top: position.y }}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              data-map-tick={mapTick}
            >
              <AlertChip
                type={alert.type}
                message={alert.message}
                isExpiring={expiringAlertIds.includes(alert.id)}
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedPlace({
                    id: `alert-place-${alert.id}`,
                    name: alertMeta[alert.type].label,
                    coordinates: alert.coordinates,
                    description: alert.message,
                    tags: ['Alerta geolocalizada'],
                    photos: [],
                    alerts: [alert.type],
                    adultsOnly: false,
                    allowsMinors: true,
                    petFriendly: false,
                    bikeSkateFriendly: false,
                  });
                  setSheetOpen(true);
                }}
              />
            </div>
          );
        })}
      </div>

      {isPickingLocation ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-[var(--spot-color-primary)] bg-white/5 shadow-[0_0_24px_rgba(249,115,22,0.35)]" />
          <button
            type="button"
            className="pointer-events-auto absolute bottom-28 rounded-2xl bg-[var(--spot-color-primary)] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              const center = mapRef.current?.getCenter();
              if (center) {
                setPickedLocationLabel(formatCoordinates(center));
              }
              setIsPickingLocation(false);
            }}
          >
            Confirmar ubicacion
          </button>
        </div>
      ) : null}

      <CategoryBar selected={categoryFilter} onSelect={setCategoryFilter} />

      <EventSheet
        isOpen={sheetOpen}
        selectedEvent={selectedEvent}
        selectedPlace={selectedPlace}
        alerts={visibleAlerts}
        onClose={() => setSheetOpen(false)}
        onSnapChange={(index) => {
          const target = selectedEvent?.coordinates ?? selectedPlace?.coordinates;
          if (!target) {
            return;
          }

          const offsetBySnap: Record<number, number> = { 0: 110, 1: 190, 2: 260 };
          mapRef.current?.easeTo({ center: target, offset: [0, offsetBySnap[index] ?? 120], duration: 260 });
        }}
      />

      <FilterSheet isOpen={filterSheetOpen} value={filters} onChange={setFilters} onClose={() => setFilterSheetOpen(false)} />

      <AlertSheet isOpen={alertSheetOpen} onClose={() => setAlertSheetOpen(false)} onSubmit={pushUserAlert} />

      <CreateEventSheet
        isOpen={createEventSheetOpen}
        onClose={() => setCreateEventSheetOpen(false)}
        onEnterPickLocation={() => {
          setCreateEventSheetOpen(false);
          setIsPickingLocation(true);
        }}
        selectedLocationLabel={pickedLocationLabel}
      />

      <BottomSheet isOpen={reportPickerOpen} onClose={() => setReportPickerOpen(false)} snapPoints={[34]} initialSnap={0} title="Reportar">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setReportPickerOpen(false);
              setCreateEventSheetOpen(true);
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-semibold"
          >
            Crear evento
          </button>
          <button
            type="button"
            onClick={() => {
              setReportPickerOpen(false);
              setAlertSheetOpen(true);
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-semibold"
          >
            Reportar alerta
          </button>
        </div>
      </BottomSheet>
    </section>
  );
}
