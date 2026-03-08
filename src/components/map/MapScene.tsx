'use client';

import { MapContainer } from '@/components/map/MapContainer';
import type { AlertFeedItem, EventFeedItem } from '@/lib/supabase/queries';

interface MapSceneProps {
  events: EventFeedItem[];
  alerts: AlertFeedItem[];
}

export function MapScene({ events, alerts }: MapSceneProps) {
  void events;
  void alerts;

  return <MapContainer />;
}
