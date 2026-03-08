import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Camera, MapView, PointAnnotation } from '@maplibre/maplibre-react-native';

import type { MobileAlertItem, MobileEventItem } from '../../lib/mockData';
import { DEFAULT_CENTER, DEFAULT_ZOOM, METRO_BOUNDS, TILE_URL } from '../../lib/map';
import { getMobileAlertsFeed, getMobileEventsFeed } from '../../lib/queries';
import { useMapStore } from '../../stores/mapStore';

export default function MapScreen() {
  const [events, setEvents] = useState<MobileEventItem[]>([]);
  const [alerts, setAlerts] = useState<MobileAlertItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MobileEventItem | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<MobileAlertItem | null>(null);
  const [sheetLevel, setSheetLevel] = useState<'min' | 'peek' | 'full'>('peek');
  const [quickFilter, setQuickFilter] = useState<'all' | 'live' | MobileEventItem['category']>('all');
  const [eventStatusQuickFilter, setEventStatusQuickFilter] = useState<'all' | 'live' | 'upcoming' | 'pending'>('all');
  const [alertQuickFilter, setAlertQuickFilter] = useState<'all' | MobileAlertItem['type']>('all');
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);
  const [sharedEventIds, setSharedEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const searchTerm = useMapStore((state) => state.searchTerm);
  const showAlerts = useMapStore((state) => state.showAlerts);
  const setSearchTerm = useMapStore((state) => state.setSearchTerm);
  const setShowAlerts = useMapStore((state) => state.setShowAlerts);

  async function loadMapData(options?: { silent?: boolean }) {
    const isSilent = options?.silent ?? false;

    if (!isSilent) {
      setIsLoading(true);
    }

    try {
      const [eventsFeed, alertsFeed] = await Promise.all([getMobileEventsFeed(), getMobileAlertsFeed()]);
      setEvents(eventsFeed);
      setAlerts(alertsFeed);
      setLoadError(null);
      setLastSyncAt(new Date().toLocaleTimeString('es-CO'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el feed del mapa.';
      setLoadError(message);
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadMapData();

    const refreshInterval = setInterval(() => {
      void loadMapData({ silent: true });
    }, 60_000);

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      if (quickFilter === 'live' && event.status !== 'live') {
        return false;
      }

      if (quickFilter !== 'all' && quickFilter !== 'live' && event.category !== quickFilter) {
        return false;
      }

      if (eventStatusQuickFilter === 'live' && event.status !== 'live') {
        return false;
      }

      if (eventStatusQuickFilter === 'pending' && event.status !== 'pending') {
        return false;
      }

      if (eventStatusQuickFilter === 'upcoming') {
        const isUpcoming = new Date(event.startAt).getTime() > now;
        if (!isUpcoming || event.status === 'rejected' || event.status === 'finished') {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      return event.title.toLowerCase().includes(normalizedSearch) || event.placeName.toLowerCase().includes(normalizedSearch);
    });
  }, [eventStatusQuickFilter, events, quickFilter, searchTerm]);

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return alerts.filter((alert) => {
      if (alertQuickFilter !== 'all' && alert.type !== alertQuickFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return alert.message.toLowerCase().includes(normalizedSearch) || alertTypeLabel(alert.type).toLowerCase().includes(normalizedSearch);
    });
  }, [alerts, alertQuickFilter, searchTerm]);

  useEffect(() => {
    if (!selectedAlert) {
      return;
    }

    const alertStillVisible = filteredAlerts.some((alert) => alert.id === selectedAlert.id);
    if (!alertStillVisible) {
      setSelectedAlert(null);
      setSheetLevel('peek');
    }
  }, [filteredAlerts, selectedAlert]);

  function closeDetails() {
    setSelectedEvent(null);
    setSelectedAlert(null);
    setSheetLevel('peek');
  }

  function resetMapExperience() {
    setQuickFilter('all');
    setEventStatusQuickFilter('all');
    setAlertQuickFilter('all');
    setSearchTerm('');
    setShowAlerts(true);
    closeDetails();
  }

  function recenterToMetro() {
    closeDetails();
  }

  function cycleSheetLevel() {
    if (sheetLevel === 'min') {
      setSheetLevel('peek');
      return;
    }

    if (sheetLevel === 'peek') {
      setSheetLevel('full');
      return;
    }

    setSheetLevel('min');
  }

  function alertTypeLabel(type: MobileAlertItem['type']): string {
    if (type === 'parking_full') {
      return 'Parqueo lleno';
    }
    if (type === 'road_closure') {
      return 'Via cerrada';
    }

    return 'Todo bien';
  }

  function categoryLabel(category: MobileEventItem['category']): string {
    if (category === 'music') return 'Musica';
    if (category === 'party') return 'Fiesta';
    if (category === 'sports') return 'Skate';
    if (category === 'art') return 'Arte';
    if (category === 'market') return 'Mercado';
    if (category === 'food') return 'Parche';
    return 'Otro';
  }

  function statusLabel(status: MobileEventItem['status']): string {
    if (status === 'live') return 'En vivo';
    if (status === 'approved') return 'Aprobado';
    if (status === 'pending') return 'Pendiente';
    if (status === 'finished') return 'Finalizado';
    return 'Rechazado';
  }

  function minutesToStart(startAt: string): number {
    return Math.round((new Date(startAt).getTime() - Date.now()) / 60_000);
  }

  function eventTimingText(startAt: string): string {
    const delta = minutesToStart(startAt);

    if (delta > 0) {
      return `Empieza en ${delta} min`;
    }

    if (delta > -180) {
      return `Activo hace ${Math.abs(delta)} min`;
    }

    return 'Evento fuera de ventana activa';
  }

  function eventAudienceTags(event: MobileEventItem): string[] {
    if (event.category === 'party') {
      return ['Adultos', 'Alto volumen'];
    }

    if (event.category === 'sports') {
      return ['Outdoor', 'Bici/Skate'];
    }

    if (event.category === 'food' || event.category === 'market') {
      return ['Familiar', 'Pet friendly'];
    }

    return ['Ambiente mixto', 'Acceso general'];
  }

  function alertSeverityLabel(alertType: MobileAlertItem['type']): 'Alta' | 'Media' | 'Informativa' {
    if (alertType === 'road_closure') {
      return 'Alta';
    }

    if (alertType === 'parking_full') {
      return 'Media';
    }

    return 'Informativa';
  }

  function handleContextAction() {
    if (selectedEvent) {
      setSharedEventIds((current) => (current.includes(selectedEvent.id) ? current : [...current, selectedEvent.id]));
      return;
    }

    if (selectedAlert) {
      setAcknowledgedAlertIds((current) => (current.includes(selectedAlert.id) ? current : [...current, selectedAlert.id]));
    }
  }

  function distanceInKm(from: [number, number], to: [number, number]): number {
    const toRad = (degrees: number) => (degrees * Math.PI) / 180;
    const earthKm = 6371;
    const [fromLng, fromLat] = from;
    const [toLng, toLat] = to;
    const dLat = toRad(toLat - fromLat);
    const dLng = toRad(toLng - fromLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthKm * c;
  }

  const selectedCoordinate = selectedEvent?.coordinate ?? selectedAlert?.coordinate ?? null;
  const cameraCenterCoordinate = selectedCoordinate ?? DEFAULT_CENTER;
  const cameraZoomLevel = selectedCoordinate ? 14.6 : DEFAULT_ZOOM;

  const nearbyEvents = useMemo(() => {
    if (!selectedCoordinate) {
      return [];
    }

    return filteredEvents
      .filter((event) => event.id !== selectedEvent?.id)
      .map((event) => ({
        event,
        distanceKm: distanceInKm(selectedCoordinate, event.coordinate),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [filteredEvents, selectedCoordinate, selectedEvent?.id]);

  return (
    <View className="flex-1 bg-background">
      <MapView mapStyle={TILE_URL} style={{ flex: 1 }} compassEnabled logoEnabled>
        <Camera
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
          centerCoordinate={cameraCenterCoordinate}
          zoomLevel={cameraZoomLevel}
          animationDuration={450}
          maxBounds={{
            sw: METRO_BOUNDS[0],
            ne: METRO_BOUNDS[1],
          }}
        />

        {filteredEvents.map((event) => (
          <PointAnnotation
            key={event.id}
            id={event.id}
            coordinate={event.coordinate}
            onSelected={() => {
              setSelectedAlert(null);
              setSelectedEvent(event);
              setSheetLevel('peek');
            }}
          >
            <View className={`h-4 w-4 rounded-full border-2 border-white ${event.status === 'live' ? 'bg-secondary' : 'bg-primary'}`} />
          </PointAnnotation>
        ))}

        {showAlerts
          ? filteredAlerts.map((alert) => (
          <PointAnnotation
            key={alert.id}
            id={alert.id}
            coordinate={alert.coordinate}
            onSelected={() => {
              setSelectedEvent(null);
              setSelectedAlert(alert);
              setSheetLevel('peek');
            }}
          >
            <View className="h-3 w-3 rounded-full border border-white bg-red-500" />
          </PointAnnotation>
            ))
          : null}
      </MapView>

      <View className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-2">
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar evento o lugar"
          className="mb-2 rounded-md border border-gray-300 px-2 py-1 text-xs text-foreground"
        />

        <Pressable onPress={() => setShowAlerts(!showAlerts)} className="mb-2 rounded-md bg-gray-100 px-2 py-1">
          <Text className="text-xs text-foreground">{showAlerts ? 'Ocultar alertas' : 'Mostrar alertas'}</Text>
        </Pressable>

        <View className="mb-2 flex-row gap-2">
          <Pressable onPress={resetMapExperience} className="rounded-md bg-gray-100 px-2 py-1">
            <Text className="text-xs text-foreground">Limpiar</Text>
          </Pressable>
          <Pressable onPress={recenterToMetro} className="rounded-md bg-gray-100 px-2 py-1">
            <Text className="text-xs text-foreground">Centro</Text>
          </Pressable>
        </View>

        <Text className="text-xs text-foreground">Eventos: {filteredEvents.length}</Text>
        <Text className="text-xs text-foreground">Alertas: {showAlerts ? filteredAlerts.length : 0}</Text>
        <Text className="text-xs text-muted">
          {isLoading ? 'Sincronizando...' : loadError ? 'Sync con errores' : `Sync OK ${lastSyncAt ? `(${lastSyncAt})` : ''}`}
        </Text>

        {loadError ? (
          <View className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-2">
            <Text className="text-xs text-red-700">{loadError}</Text>
            <Pressable onPress={() => void loadMapData()} className="mt-2 self-start rounded-md bg-red-600 px-2 py-1">
              <Text className="text-xs font-medium text-white">Reintentar</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View className="absolute bottom-4 left-4 right-4 rounded-md bg-white/95 px-3 py-2">
        <Text className="text-xs text-muted">Area limitada a Medellin y su zona metropolitana.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'live', label: 'En vivo' },
              { id: 'music', label: 'Musica' },
              { id: 'party', label: 'Fiesta' },
              { id: 'sports', label: 'Skate' },
              { id: 'art', label: 'Arte' },
              { id: 'market', label: 'Mercado' },
              { id: 'food', label: 'Parche' },
            ].map((item) => {
              const active = quickFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setQuickFilter(item.id as 'all' | 'live' | MobileEventItem['category'])}
                  className={`rounded-full px-3 py-1 ${active ? 'bg-primary' : 'bg-gray-100'}`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-foreground'}`}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2">
            {[
              { id: 'all', label: 'Estado: Todos' },
              { id: 'live', label: 'Activos' },
              { id: 'upcoming', label: 'Proximos' },
              { id: 'pending', label: 'Pendientes' },
            ].map((item) => {
              const active = eventStatusQuickFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setEventStatusQuickFilter(item.id as 'all' | 'live' | 'upcoming' | 'pending')}
                  className={`rounded-full px-3 py-1 ${active ? 'bg-emerald-600' : 'bg-gray-100'}`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-foreground'}`}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2">
            {[
              { id: 'all', label: 'Alertas: Todas' },
              { id: 'road_closure', label: 'Cierres' },
              { id: 'parking_full', label: 'Parqueo' },
              { id: 'all_clear', label: 'Todo bien' },
            ].map((item) => {
              const active = alertQuickFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setAlertQuickFilter(item.id as 'all' | MobileAlertItem['type'])}
                  className={`rounded-full px-3 py-1 ${active ? 'bg-secondary' : 'bg-gray-100'}`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-foreground'}`}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {filteredEvents.length === 0 && !isLoading ? (
        <View className="absolute bottom-44 left-4 right-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <Text className="text-xs font-medium text-amber-900">No hay eventos con estos filtros.</Text>
          <Pressable onPress={resetMapExperience} className="mt-2 self-start rounded-md bg-amber-500 px-2 py-1">
            <Text className="text-xs font-medium text-white">Restaurar vista</Text>
          </Pressable>
        </View>
      ) : null}

      {selectedEvent || selectedAlert ? (
        <View
          className={`absolute left-4 right-4 rounded-xl border border-gray-200 bg-white p-4 shadow ${sheetLevel === 'full' ? 'bottom-4' : 'bottom-20'}`}
          style={{
            minHeight: sheetLevel === 'min' ? 120 : sheetLevel === 'peek' ? 210 : 320,
          }}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">{selectedEvent?.title ?? alertTypeLabel(selectedAlert!.type)}</Text>
              <Text className="mt-1 text-sm text-muted">{selectedEvent?.placeName ?? selectedAlert?.message}</Text>
            </View>
            <Pressable onPress={closeDetails} className="rounded-md bg-gray-100 px-2 py-1">
              <Text className="text-xs font-medium text-foreground">Cerrar</Text>
            </Pressable>
          </View>

          {sheetLevel !== 'min' ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {selectedEvent ? <Text className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">{selectedEvent.status}</Text> : null}
              {selectedEvent ? <Text className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{selectedEvent.category}</Text> : null}
              {selectedAlert ? <Text className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">{selectedAlert.type}</Text> : null}
            </View>
          ) : null}

          {sheetLevel !== 'min' && selectedEvent ? <Text className="mt-3 text-xs text-muted">Inicio: {new Date(selectedEvent.startAt).toLocaleString('es-CO')}</Text> : null}
          {sheetLevel !== 'min' && selectedAlert ? <Text className="mt-3 text-xs text-muted">Reporte activo en esta zona.</Text> : null}

          {sheetLevel === 'full' ? (
            <View className="mt-3 gap-2">
              {selectedEvent ? (
                <View className="rounded-md bg-gray-50 p-3">
                  <Text className="text-xs font-semibold text-foreground">Contexto rapido</Text>
                  <Text className="mt-1 text-xs text-muted">{eventTimingText(selectedEvent.startAt)}</Text>
                  <Text className="mt-1 text-xs text-muted">Estado: {statusLabel(selectedEvent.status)}</Text>
                  <Text className="mt-1 text-xs text-muted">Categoria: {categoryLabel(selectedEvent.category)}</Text>

                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {eventAudienceTags(selectedEvent).map((tag) => (
                      <Text key={tag} className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        {tag}
                      </Text>
                    ))}
                  </View>
                </View>
              ) : null}

              {selectedAlert ? (
                <View className="rounded-md bg-rose-50 p-3">
                  <Text className="text-xs font-semibold text-rose-800">Alerta en campo</Text>
                  <Text className="mt-1 text-xs text-rose-700">Severidad: {alertSeverityLabel(selectedAlert.type)}</Text>
                  <Text className="mt-1 text-xs text-rose-700">Mensaje: {selectedAlert.message}</Text>
                  <Text className="mt-1 text-xs text-rose-700">
                    Confirmacion comunitaria: {acknowledgedAlertIds.includes(selectedAlert.id) ? 'Validada por ti' : 'Pendiente'}
                  </Text>
                </View>
              ) : null}

              {nearbyEvents.length > 0 ? (
                <View className="rounded-md bg-sky-50 p-3">
                  <Text className="text-xs font-semibold text-sky-900">Eventos cerca</Text>
                  <View className="mt-2 gap-2">
                    {nearbyEvents.map(({ event, distanceKm }) => (
                      <Pressable
                        key={event.id}
                        onPress={() => {
                          setSelectedAlert(null);
                          setSelectedEvent(event);
                          setSheetLevel('peek');
                        }}
                        className="rounded-md border border-sky-100 bg-white px-2 py-2"
                      >
                        <Text className="text-xs font-semibold text-sky-900">{event.title}</Text>
                        <Text className="mt-1 text-xs text-sky-700">
                          {categoryLabel(event.category)} · {statusLabel(event.status)} · {distanceKm.toFixed(2)} km
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="mt-3 flex-row gap-2">
            <Pressable onPress={cycleSheetLevel} className="flex-1 items-center justify-center rounded-md bg-primary py-2">
              <Text className="text-sm font-medium text-white">
                {sheetLevel === 'min' ? 'Subir' : sheetLevel === 'peek' ? 'Expandir' : 'Compactar'}
              </Text>
            </Pressable>
            <Pressable onPress={handleContextAction} className="flex-1 items-center justify-center rounded-md bg-gray-900 py-2">
              <Text className="text-sm font-medium text-white">
                {selectedEvent
                  ? sharedEventIds.includes(selectedEvent.id)
                    ? 'Compartido'
                    : 'Compartir'
                  : selectedAlert && acknowledgedAlertIds.includes(selectedAlert.id)
                    ? 'Confirmada'
                    : 'Confirmar'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
