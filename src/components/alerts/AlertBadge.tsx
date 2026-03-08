type AlertTypeValue =
  | 'police_presence'
  | 'road_closure'
  | 'venue_full'
  | 'public_disorder'
  | 'heavy_rain'
  | 'parking_full'
  | 'checkpoint'
  | 'all_clear'
  | 'tickets_at_door'
  | 'artist_on_stage'
  | 'schedule_change';

interface AlertBadgeProps {
  type: AlertTypeValue;
}

export function AlertBadge({ type }: AlertBadgeProps) {
  return (
    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
      {type.replaceAll('_', ' ')}
    </span>
  );
}
