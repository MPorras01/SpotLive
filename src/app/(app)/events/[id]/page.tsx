import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EventStatus } from '@/components/events/EventStatus';
import { getEventFeedById } from '@/lib/supabase/queries';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventFeedById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <Link href="/events" className="inline-flex text-sm font-medium text-primary hover:underline">
        Volver al listado
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
          <EventStatus status={event.status} />
        </div>

        <p className="mb-4 text-sm text-gray-700">{event.description}</p>

        <dl className="grid gap-3 text-sm text-gray-600 md:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-900">Lugar</dt>
            <dd>{event.placeName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Categoria</dt>
            <dd>{event.category}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Inicio</dt>
            <dd>{new Date(event.startAt).toLocaleString('es-CO')}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Fin</dt>
            <dd>{new Date(event.endAt).toLocaleString('es-CO')}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
