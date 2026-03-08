type EventStatusValue = 'pending' | 'approved' | 'live' | 'finished' | 'rejected';

interface EventStatusProps {
  status: EventStatusValue;
}

const statusLabel: Record<EventStatusValue, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  live: 'En vivo',
  finished: 'Finalizado',
  rejected: 'Rechazado',
};

export function EventStatus({ status }: EventStatusProps) {
  return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">{statusLabel[status]}</span>;
}
