import { categoryEmoji, type UiCategory } from '@/components/map/mockMapData';

interface EventPinProps {
  category?: UiCategory;
  status?: 'live' | 'approved';
  variant?: 'event' | 'place';
  onClick: () => void;
}

export function EventPin({ category = 'music', status = 'approved', variant = 'event', onClick }: EventPinProps) {
  const emoji = variant === 'place' ? '📍' : categoryEmoji[category];
  const isLive = status === 'live' && variant === 'event';

  if (variant === 'place') {
    return (
      <button type="button" onClick={onClick} className="spot-pin-tap spot-place-pin" aria-label="Lugar permanente">
        <span className="text-sm">{emoji}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`spot-pin-tap ${isLive ? 'spot-event-pin-live' : 'spot-event-pin-upcoming'}`}
      aria-label="Pin de evento"
    >
      {isLive ? <span className="spot-live-ping" aria-hidden /> : null}
      <span className="relative z-10 text-lg">{emoji}</span>
    </button>
  );
}
