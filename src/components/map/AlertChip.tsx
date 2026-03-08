import { alertMeta, type UiAlertType } from '@/components/map/mockMapData';

interface AlertChipProps {
  type: UiAlertType;
  message: string;
  onClick: () => void;
  isExpiring?: boolean;
}

export function AlertChip({ type, message, onClick, isExpiring = false }: AlertChipProps) {
  const meta = alertMeta[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`spot-alert-chip ${meta.pulse ? 'spot-alert-chip-pulse' : ''} ${isExpiring ? 'spot-alert-chip-expiring' : ''}`}
      style={{ borderLeftColor: meta.color }}
      title={meta.label}
    >
      <span aria-hidden>{meta.emoji}</span>
      <span className="truncate text-left text-xs font-semibold text-[var(--spot-color-text)]">{message}</span>
    </button>
  );
}
