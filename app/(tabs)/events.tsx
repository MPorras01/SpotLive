import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';

import type { MobileEventItem } from '../../lib/mockData';
import { getMobileEventsFeed } from '../../lib/queries';
import { useMapStore } from '../../stores/mapStore';

export default function EventsScreen() {
  const [events, setEvents] = useState<MobileEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchTerm = useMapStore((state) => state.searchTerm);
  const setSearchTerm = useMapStore((state) => state.setSearchTerm);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      const feed = await getMobileEventsFeed();
      setEvents(feed);
      setIsLoading(false);
    }

    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return events;
    }

    return events.filter((event) =>
      event.title.toLowerCase().includes(normalizedSearch) || event.placeName.toLowerCase().includes(normalizedSearch),
    );
  }, [events, searchTerm]);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="mb-4 text-xl font-semibold text-foreground">Eventos en vivo</Text>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Buscar evento o lugar"
        className="mb-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-foreground"
      />
      <Text className="mb-3 text-xs text-muted">{isLoading ? 'Cargando eventos...' : `${filteredEvents.length} eventos disponibles`}</Text>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View className="rounded-lg border border-gray-200 bg-white p-4">
            <Text className="text-base font-semibold text-foreground">{item.title}</Text>
            <Text className="mt-1 text-sm text-muted">{item.placeName}</Text>
            <Text className="mt-1 text-xs text-muted">{new Date(item.startAt).toLocaleString('es-CO')}</Text>
            <Text className="mt-2 text-xs uppercase tracking-wide text-primary">{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}
