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
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);
  const [sharedEventIds, setSharedEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchTerm = useMapStore((state) => state.searchTerm);
  const showAlerts = useMapStore((state) => state.showAlerts);
  const setSearchTerm = useMapStore((state) => state.setSearchTerm);
  const setShowAlerts = useMapStore((state) => state.setShowAlerts);

  useEffect(() => {
    async function loadMapData() {
      setIsLoading(true);
      const [eventsFeed, alertsFeed] = await Promise.all([getMobileEventsFeed(), getMobileAlertsFeed()]);
      setEvents(eventsFeed);
      setAlerts(alertsFeed);
      setIsLoading(false);
    }

    void loadMapData();
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return events.filter((event) => {
      if (quickFilter === 'live' && event.status !== 'live') {
        return false;
      }

      if (quickFilter !== 'all' && quickFilter !== 'live' && event.category !== quickFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return event.title.toLowerCase().includes(normalizedSearch) || event.placeName.toLowerCase().includes(normalizedSearch);
    });
  }, [events, quickFilter, searchTerm]);

  function closeDetails() {
    setSelectedEvent(null);
    setSelectedAlert(null);
    setSheetLevel('peek');
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

  return (
    <View className="flex-1 bg-background">
      <MapView mapStyle={TILE_URL} style={{ flex: 1 }} compassEnabled logoEnabled>
        <Camera
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
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
          ? alerts.map((alert) => (
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

        <Text className="text-xs text-foreground">Eventos: {filteredEvents.length}</Text>
        <Text className="text-xs text-foreground">Alertas: {showAlerts ? alerts.length : 0}</Text>
        <Text className="text-xs text-muted">{isLoading ? 'Sincronizando...' : 'Datos sincronizados'}</Text>
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
      </View>

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
