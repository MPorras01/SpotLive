'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ModerationEventItem } from '@/lib/supabase/queries';

type ModerationItem = ModerationEventItem;

export function EventModerationTable() {
  const [events, setEvents] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  async function loadPendingEvents() {
    setIsLoading(true);
    setFeedback('');

    try {
      const response = await fetch('/api/admin/events/pending', { method: 'GET' });
      if (!response.ok) {
        throw new Error('No se pudo consultar la cola de moderacion.');
      }

      const payload = (await response.json()) as { events?: ModerationItem[] };
      setEvents(payload.events ?? []);
    } catch (error) {
      // Comentario de negocio: mostramos error de lectura pero mantenemos la pantalla operativa.
      setFeedback(error instanceof Error ? error.message : 'Error cargando eventos pendientes.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function run() {
      await loadPendingEvents();
    }

    void run();
  }, []);

  const pendingEvents = useMemo(() => events.filter((event) => event.status === 'pending'), [events]);

  async function updateStatus(eventId: string, nextStatus: 'approved' | 'rejected') {
    setUpdatingId(eventId);
    setFeedback('');

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado del evento.');
      }

      const payload = (await response.json()) as { source?: 'supabase'; message?: string };

      setEvents((currentEvents) => currentEvents.map((event) => (event.id === eventId ? { ...event, status: nextStatus } : event)));

      if (payload.message) {
        setFeedback(payload.message);
      }
    } catch (error) {
      // Comentario de negocio: dejamos trazabilidad del fallo para que moderacion pueda reintentar.
      setFeedback(error instanceof Error ? error.message : 'Error actualizando estado.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return <p className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">Cargando eventos pendientes...</p>;
  }

  if (pendingEvents.length === 0) {
    return (
      <div className="space-y-2">
        {feedback ? <p className="text-sm text-amber-700">{feedback}</p> : null}
        <p className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">No hay eventos pendientes por moderar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feedback ? <p className="text-sm text-amber-700">{feedback}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Evento</th>
              <th className="px-4 py-3 font-medium">Lugar</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingEvents.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                <td className="px-4 py-3 text-gray-600">{event.placeName}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(event.startsAt).toLocaleString('es-CO')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={updatingId === event.id}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                      onClick={() => updateStatus(event.id, 'approved')}
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === event.id}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                      onClick={() => updateStatus(event.id, 'rejected')}
                    >
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
