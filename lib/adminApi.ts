import { Platform } from 'react-native';

import { supabase } from './supabase';

export interface MobileModerationEvent {
  id: string;
  title: string;
  placeName: string;
  startsAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'live' | 'finished';
}

function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_WEB_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!supabase) {
    return headers;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    return headers;
  }

  headers.Authorization = `Bearer ${data.session.access_token}`;
  return headers;
}

export async function getPendingModerationEvents(): Promise<MobileModerationEvent[]> {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  try {
    const response = await fetch(`${baseUrl}/api/admin/events/pending`, {
      method: 'GET',
      headers,
    });

    const payload = (await response.json().catch(() => ({}))) as { events?: MobileModerationEvent[]; error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? 'No se pudo cargar la cola de moderacion.');
    }

    return payload.events ?? [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error de red consultando moderacion.');
  }
}

export async function updateModerationStatus(eventId: string, status: 'approved' | 'rejected'): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  try {
    const response = await fetch(`${baseUrl}/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? 'No se pudo actualizar el evento.');
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error de red actualizando moderacion.');
  }
}
