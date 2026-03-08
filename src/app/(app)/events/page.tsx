import { EventCard } from '@/components/events/EventCard';
import { getEventsFeed } from '@/lib/supabase/queries';

export default async function EventsPage() {
  const events = await getEventsFeed();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Primeros eventos</h1>
        <p className="text-sm text-gray-600">Listado inicial para validar flujo de descubrimiento.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} id={event.id} title={event.title} place={event.placeName} startAt={event.startAt} status={event.status} />
        ))}
      </div>
    </section>
  );
}
