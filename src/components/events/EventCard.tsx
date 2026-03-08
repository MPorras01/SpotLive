import Link from 'next/link';

import { EventStatus } from '@/components/events/EventStatus';

interface EventCardProps {
  id: string;
  title: string;
  place: string;
  startAt: string;
  status: 'pending' | 'approved' | 'live' | 'finished' | 'rejected';
}

export function EventCard({ id, title, place, startAt, status }: EventCardProps) {
  return (
    <article className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <EventStatus status={status} />
      </div>
      <p className="text-sm text-gray-500">{place}</p>
      <p className="text-xs text-gray-500">Inicio: {new Date(startAt).toLocaleString('es-CO')}</p>
      <Link href={`/events/${id}`} className="inline-flex text-xs font-medium text-primary hover:underline">
        Ver detalle
      </Link>
    </article>
  );
}
