import type { AlertType, EventStatus } from '@spotlive/types';

import { demoAlerts, demoEvents, demoPlaces, placeCoordinates } from '@/lib/mockData';
import { createClient } from '@/lib/supabase/server';

export interface EventFeedItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: EventStatus;
  startAt: string;
  endAt: string;
  placeId: string;
  placeName: string;
  longitude: number | null;
  latitude: number | null;
}

export interface AlertFeedItem {
  id: string;
  type: AlertType;
  message: string;
  placeId: string | null;
  eventId: string | null;
  createdAt: string;
  longitude: number | null;
  latitude: number | null;
}

export interface ModerationEventItem {
  id: string;
  title: string;
  placeName: string;
  startsAt: string;
  status: EventStatus;
}

type ModerationUpdateResult = {
  success: boolean;
  source: 'supabase';
  message?: string;
};

function parsePoint(point: unknown): { longitude: number; latitude: number } | null {
  if (!point) {
    return null;
  }

  if (typeof point === 'string') {
    const match = point.match(/POINT\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i);
    if (!match) {
      return null;
    }

    const longitude = Number(match[1]);
    const latitude = Number(match[2]);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return null;
    }

    return { longitude, latitude };
  }

  if (typeof point === 'object' && point !== null && 'coordinates' in point) {
    const coordinates = (point as { coordinates?: unknown }).coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return null;
    }

    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return null;
    }

    return { longitude, latitude };
  }

  return null;
}

function getFallbackEvents(): EventFeedItem[] {
  return demoEvents.map((event) => {
    const place = demoPlaces.find((item) => item.id === event.placeId);
    const point = placeCoordinates[event.placeId] ?? null;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      status: event.status,
      startAt: event.startAt,
      endAt: event.endAt,
      placeId: event.placeId,
      placeName: place?.name ?? 'Lugar no encontrado',
      longitude: point?.longitude ?? null,
      latitude: point?.latitude ?? null,
    };
  });
}

function getFallbackAlerts(): AlertFeedItem[] {
  return demoAlerts.map((alert) => {
    const [longitude, latitude] = alert.location.split(',').map(Number);

    return {
      id: alert.id,
      type: alert.type,
      message: alert.message,
      placeId: alert.placeId ?? null,
      eventId: alert.eventId ?? null,
      createdAt: alert.createdAt,
      longitude: Number.isFinite(longitude) ? longitude : null,
      latitude: Number.isFinite(latitude) ? latitude : null,
    };
  });
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getEventsFeed(): Promise<EventFeedItem[]> {
  if (!isSupabaseConfigured()) {
    return getFallbackEvents();
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select(
        `
          id,
          title,
          description,
          category,
          status,
          start_at,
          end_at,
          place_id,
          places (
            id,
            name,
            location
          )
        `,
      )
      .eq('is_deleted', false)
      .order('start_at', { ascending: true });

    if (error) {
      // Comentario de negocio: mantenemos experiencia funcional aun cuando falle la lectura remota.
      console.error('Supabase getEventsFeed error:', error.message);
      return getFallbackEvents();
    }

    return (data ?? []).map((row) => {
      const place = Array.isArray(row.places) ? row.places[0] : row.places;
      const point = parsePoint(place?.location);

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        status: row.status,
        startAt: row.start_at,
        endAt: row.end_at,
        placeId: row.place_id,
        placeName: place?.name ?? 'Lugar no encontrado',
        longitude: point?.longitude ?? null,
        latitude: point?.latitude ?? null,
      } as EventFeedItem;
    });
  } catch (error) {
    // Comentario de negocio: fallback local para no bloquear iteracion de producto en desarrollo.
    console.error('Supabase getEventsFeed exception:', error);
    return getFallbackEvents();
  }
}

export async function getEventFeedById(eventId: string): Promise<EventFeedItem | null> {
  const events = await getEventsFeed();
  return events.find((event) => event.id === eventId) ?? null;
}

export async function getAlertsFeed(): Promise<AlertFeedItem[]> {
  if (!isSupabaseConfigured()) {
    return getFallbackAlerts();
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('alerts')
      .select('id, type, message, place_id, event_id, location, created_at, expires_at, is_deleted')
      .eq('is_deleted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // Comentario de negocio: una falla de alertas no debe tumbar el modulo de mapa.
      console.error('Supabase getAlertsFeed error:', error.message);
      return getFallbackAlerts();
    }

    return (data ?? []).map((row) => {
      const point = parsePoint(row.location);

      return {
        id: row.id,
        type: row.type,
        message: row.message,
        placeId: row.place_id,
        eventId: row.event_id,
        createdAt: row.created_at,
        longitude: point?.longitude ?? null,
        latitude: point?.latitude ?? null,
      } as AlertFeedItem;
    });
  } catch (error) {
    // Comentario de negocio: conservamos continuidad de operacion con datos mock.
    console.error('Supabase getAlertsFeed exception:', error);
    return getFallbackAlerts();
  }
}

export async function getPendingModerationEvents(): Promise<ModerationEventItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select(
        `
          id,
          title,
          status,
          start_at,
          place_id,
          places (
            id,
            name
          )
        `,
      )
      .eq('is_deleted', false)
      .eq('status', 'pending')
      .order('start_at', { ascending: true });

    if (error) {
      // Comentario de negocio: sin fuente confiable no exponemos cola para evitar moderacion inconsistente.
      console.error('Supabase getPendingModerationEvents error:', error.message);
      return [];
    }

    return (data ?? []).map((row) => {
      const place = Array.isArray(row.places) ? row.places[0] : row.places;
      return {
        id: row.id,
        title: row.title,
        placeName: place?.name ?? 'Lugar no encontrado',
        startsAt: row.start_at,
        status: row.status,
      } as ModerationEventItem;
    });
  } catch (error) {
    // Comentario de negocio: ante error operativo devolvemos lista vacia para no aprobar datos incorrectos.
    console.error('Supabase getPendingModerationEvents exception:', error);
    return [];
  }
}

export async function updateModerationEventStatus(eventId: string, status: 'approved' | 'rejected'): Promise<ModerationUpdateResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, source: 'supabase', message: 'Supabase no esta configurado.' };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .eq('is_deleted', false);

    if (error) {
      // Comentario de negocio: la moderacion debe fallar explicitamente si RLS no permite persistir.
      console.error('Supabase updateModerationEventStatus error:', error.message);
      return { success: false, source: 'supabase', message: error.message };
    }

    return { success: true, source: 'supabase' };
  } catch (error) {
    // Comentario de negocio: se retorna error para forzar reintento y visibilidad del incidente.
    console.error('Supabase updateModerationEventStatus exception:', error);
    return { success: false, source: 'supabase', message: 'Error interno de moderacion.' };
  }
}
