import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { getPendingModerationEvents, type MobileModerationEvent, updateModerationStatus } from '../../lib/adminApi';
import { useAuthStore } from '../../stores/authStore';

export default function AdminScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const [events, setEvents] = useState<MobileModerationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setFeedback('');

    try {
      const pending = await getPendingModerationEvents();
      setEvents(pending.filter((item) => item.status === 'pending'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo cargar moderacion.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  async function updateEventStatus(eventId: string, status: 'approved' | 'rejected') {
    setProcessingId(eventId);
    setFeedback('');

    try {
      await updateModerationStatus(eventId, status);
      setEvents((current) => current.filter((item) => item.id !== eventId));
      setFeedback(status === 'approved' ? 'Evento aprobado.' : 'Evento rechazado.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo actualizar el evento.');
    } finally {
      setProcessingId(null);
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <View className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Text className="text-base font-semibold text-amber-900">Panel de moderacion</Text>
          <Text className="mt-2 text-sm text-amber-800">Solo administradores pueden aprobar o rechazar eventos.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-xl font-semibold text-foreground">Moderacion</Text>
      <Text className="mt-1 text-xs text-muted">Eventos pendientes para aprobar o rechazar.</Text>

      {feedback ? <Text className="mt-3 text-sm text-amber-700">{feedback}</Text> : null}

      <Pressable onPress={() => void loadPending()} className="mt-3 h-10 items-center justify-center rounded-md border border-gray-300 bg-white">
        <Text className="text-sm font-medium text-foreground">Recargar cola</Text>
      </Pressable>

      {isLoading ? (
        <View className="mt-5 items-center">
          <ActivityIndicator />
          <Text className="mt-2 text-xs text-muted">Cargando eventos...</Text>
        </View>
      ) : (
        <FlatList
          className="mt-4"
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          ListEmptyComponent={<Text className="text-sm text-muted">No hay eventos pendientes.</Text>}
          renderItem={({ item }) => (
            <View className="rounded-lg border border-gray-200 bg-white p-4">
              <Text className="text-base font-semibold text-foreground">{item.title}</Text>
              <Text className="mt-1 text-sm text-muted">{item.placeName}</Text>
              <Text className="mt-1 text-xs text-muted">{new Date(item.startsAt).toLocaleString('es-CO')}</Text>

              <View className="mt-3 flex-row gap-2">
                <Pressable
                  disabled={processingId === item.id}
                  onPress={() => void updateEventStatus(item.id, 'approved')}
                  className="flex-1 items-center justify-center rounded-md bg-emerald-600 py-2 disabled:opacity-60"
                >
                  <Text className="text-sm font-medium text-white">Aprobar</Text>
                </Pressable>

                <Pressable
                  disabled={processingId === item.id}
                  onPress={() => void updateEventStatus(item.id, 'rejected')}
                  className="flex-1 items-center justify-center rounded-md bg-red-600 py-2 disabled:opacity-60"
                >
                  <Text className="text-sm font-medium text-white">Rechazar</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
