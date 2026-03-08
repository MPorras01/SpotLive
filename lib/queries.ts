import type { EventStatus, UserRole } from '@spotlive/types';

import { demoMobileAlerts, demoMobileEvents, type MobileAlertItem, type MobileEventItem } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';

export interface MobileSessionProfile {
  id: string;
  email: string;
  role: UserRole | null;
}

function parsePoint(point: unknown): [number, number] | null {
  if (!point) {
    return null;
  }

  if (typeof point === 'string') {
    const match = point.match(/POINT\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i);
    if (!match) {
      return null;
    }

    const lng = Number(match[1]);
    const lat = Number(match[2]);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return null;
    }

    return [lng, lat];
  }

  if (typeof point === 'object' && point !== null && 'coordinates' in point) {
    const coordinates = (point as { coordinates?: unknown }).coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return null;
    }

    const lng = Number(coordinates[0]);
    const lat = Number(coordinates[1]);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return null;
    }

    return [lng, lat];
  }

  return null;
}

export async function getMobileSessionProfile(): Promise<MobileSessionProfile | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .eq('is_deleted', false)
    .maybeSingle();

  return {
    id: userData.user.id,
    email: userData.user.email ?? '',
    role: (profile?.role as UserRole | undefined) ?? null,
  };
}

export async function getMobileEventsFeed(): Promise<MobileEventItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return demoMobileEvents;
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select(
        `
          id,
          title,
          category,
          status,
          start_at,
          place_id,
          places (
            id,
            name,
            location
          )
        `,
      )
      .eq('is_deleted', false)
      .order('start_at', { ascending: true })
      .limit(100);

    if (error) {
      // Comentario de negocio: mantenemos continuidad visual usando seed local si falla backend.
      return demoMobileEvents;
    }

    return (data ?? [])
      .map((row) => {
        const place = Array.isArray(row.places) ? row.places[0] : row.places;
        const coordinate = parsePoint(place?.location);

        if (!coordinate) {
          return null;
        }

        return {
          id: row.id,
          title: row.title,
          placeName: place?.name ?? 'Lugar no encontrado',
          category: row.category,
          status: row.status as EventStatus,
          startAt: row.start_at,
          coordinate,
        } as MobileEventItem;
      })
      .filter((item): item is MobileEventItem => item !== null);
  } catch (error) {
    return demoMobileEvents;
  }
}

export async function getMobileAlertsFeed(): Promise<MobileAlertItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    return demoMobileAlerts;
  }

  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('id, message, type, location, expires_at, is_deleted')
      .eq('is_deleted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return demoMobileAlerts;
    }

    return (data ?? [])
      .map((row) => {
        const coordinate = parsePoint(row.location);
        if (!coordinate) {
          return null;
        }

        return {
          id: row.id,
          message: row.message,
          type: row.type,
          coordinate,
        } as MobileAlertItem;
      })
      .filter((item): item is MobileAlertItem => item !== null);
  } catch (error) {
    return demoMobileAlerts;
  }
}
