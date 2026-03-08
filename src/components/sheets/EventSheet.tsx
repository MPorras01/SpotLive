'use client';

import { useMemo } from 'react';

import { BottomSheet } from '@/components/shared/BottomSheet';
import { alertMeta, categoryEmoji, demoComments, type MapAlert, type MapEvent, type MapPlace } from '@/components/map/mockMapData';

interface EventSheetProps {
  isOpen: boolean;
  selectedEvent: MapEvent | null;
  selectedPlace: MapPlace | null;
  alerts: MapAlert[];
  onClose: () => void;
  onSnapChange: (index: number) => void;
}

export function EventSheet({ isOpen, selectedEvent, selectedPlace, alerts, onClose, onSnapChange }: EventSheetProps) {
  const title = selectedEvent?.title ?? selectedPlace?.name ?? 'Detalle';
  const description = selectedEvent?.description ?? selectedPlace?.description ?? '';
  const tags = (selectedEvent?.tags ?? selectedPlace?.tags ?? []).slice(0, 4);
  const allTags = selectedEvent?.tags ?? selectedPlace?.tags ?? [];
  const photos = selectedEvent?.photos ?? selectedPlace?.photos ?? [];

  const activeAlerts = useMemo(() => {
    const source = selectedEvent
      ? alerts.filter((alert) => alert.coordinates[0] === selectedEvent.coordinates[0] && alert.coordinates[1] === selectedEvent.coordinates[1])
      : selectedPlace
        ? alerts.filter((alert) => selectedPlace.alerts.includes(alert.type))
        : [];

    return source;
  }, [alerts, selectedEvent, selectedPlace]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapPoints={[30, 70, 95]} initialSnap={0} onSnapChange={onSnapChange}>
      <article className="space-y-4">
        {photos[0] ? <img src={photos[0]} alt={title} className="h-44 w-full rounded-2xl object-cover" /> : null}

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--spot-color-text)]">{title}</h2>
              <p className="text-xs text-[var(--spot-color-muted)]">{selectedEvent?.placeName ?? 'Lugar permanente'}</p>
            </div>
            {selectedEvent ? (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedEvent.status === 'live' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-200'}`}>
                {selectedEvent.status === 'live' ? 'EN VIVO 🔴' : selectedEvent.startsLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="spot-action-btn">🔔 Guardar</button>
            <button type="button" className="spot-action-btn">⚠️ Alertar</button>
            <button type="button" className="spot-action-btn">↗️ Compartir</button>
          </div>
        </div>

        <section className="space-y-3 border-t border-white/10 pt-3">
          <p className="text-sm leading-6 text-[var(--spot-color-text)]">{description}</p>

          {photos.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.slice(1).map((photo) => (
                <img key={photo} src={photo} alt="Galeria" className="h-24 w-36 rounded-xl object-cover" />
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-2 border-t border-white/10 pt-3">
          <h3 className="text-sm font-semibold">Ambiente</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
            {selectedEvent ? <span className="rounded-full border border-white/10 px-3 py-1 text-xs">{categoryEmoji[selectedEvent.category]} {selectedEvent.category}</span> : null}
          </div>
        </section>

        <section className="space-y-2 border-t border-white/10 pt-3">
          <h3 className="text-sm font-semibold">Alertas activas</h3>
          {activeAlerts.length === 0 ? <p className="text-xs text-[var(--spot-color-muted)]">Sin alertas en este lugar.</p> : null}
          {activeAlerts.map((alert) => {
            const meta = alertMeta[alert.type];
            return (
              <div key={alert.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" style={{ boxShadow: `inset 2px 0 0 ${meta.color}` }}>
                {meta.emoji} {alert.message}
              </div>
            );
          })}
        </section>

        <section className="space-y-3 border-t border-white/10 pt-3">
          <h3 className="text-sm font-semibold">Comentarios</h3>
          <div className="space-y-2">
            {demoComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-white/20" />
                <div>
                  <p className="text-sm font-semibold">{comment.author}</p>
                  <p className="text-xs text-[var(--spot-color-muted)]">{comment.content}</p>
                  <p className="text-xs text-[var(--spot-color-muted)]">{comment.relativeTime}</p>
                </div>
              </div>
            ))}
          </div>
          <input className="spot-floating-input" placeholder="Escribe un comentario" />
        </section>

        {selectedEvent ? (
          <section className="border-t border-white/10 pt-3">
            <p className="text-xs text-[var(--spot-color-muted)]">
              Organiza: <span className="font-semibold text-[var(--spot-color-text)]">{selectedEvent.organizer}</span>{' '}
              {selectedEvent.organizerVerified ? '✅' : ''}
            </p>
          </section>
        ) : null}
      </article>
    </BottomSheet>
  );
}
