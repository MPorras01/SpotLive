'use client';

import { useMemo, useState } from 'react';

import { BottomSheet } from '@/components/shared/BottomSheet';
import { alertMeta, type UiAlertType } from '@/components/map/mockMapData';

interface AlertSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: UiAlertType) => void;
}

const options: UiAlertType[] = [
  'police_presence',
  'road_closure',
  'venue_full',
  'public_disorder',
  'heavy_rain',
  'all_clear',
  'parking_full',
  'artist_on_stage',
];

export function AlertSheet({ isOpen, onClose, onSubmit }: AlertSheetProps) {
  const [selected, setSelected] = useState<UiAlertType | null>(null);
  const selectedMeta = useMemo(() => (selected ? alertMeta[selected] : null), [selected]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapPoints={[52]} initialSnap={0} title="Que esta pasando?">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {options.map((type) => {
            const meta = alertMeta[type];
            const isActive = selected === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelected(type)}
                className={`rounded-2xl border px-3 py-4 text-left transition ${
                  isActive ? 'border-transparent bg-white/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                style={isActive ? { boxShadow: `inset 0 0 0 1px ${meta.color}` } : undefined}
              >
                <p className="text-lg">{meta.emoji}</p>
                <p className="mt-1 text-sm font-semibold">{meta.label}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) {
              return;
            }
            onSubmit(selected);
            setSelected(null);
            onClose();
          }}
          className="w-full rounded-2xl bg-[var(--spot-color-primary)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reportar{selectedMeta ? ` ${selectedMeta.emoji}` : ''}
        </button>
      </div>
    </BottomSheet>
  );
}
