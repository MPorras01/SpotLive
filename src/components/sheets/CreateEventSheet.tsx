'use client';

import { useMemo, useState } from 'react';

import { BottomSheet } from '@/components/shared/BottomSheet';
import { categoryEmoji, type UiCategory } from '@/components/map/mockMapData';

interface CreateEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterPickLocation: () => void;
  selectedLocationLabel: string;
}

const categoryList: UiCategory[] = ['music', 'party', 'sports', 'art', 'market', 'parche'];

export function CreateEventSheet({ isOpen, onClose, onEnterPickLocation, selectedLocationLabel }: CreateEventSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<UiCategory>('music');
  const [name, setName] = useState('');

  const canSend = useMemo(() => name.trim().length > 3 && selectedLocationLabel.length > 0, [name, selectedLocationLabel]);

  const resetAndClose = () => {
    setStep(1);
    setName('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={resetAndClose} snapPoints={[95]} initialSnap={0} title="Crear evento">
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--spot-color-muted)]">Paso 1: toca el mapa para ubicar el evento.</p>
          <button
            type="button"
            onClick={onEnterPickLocation}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left"
          >
            <p className="text-sm font-semibold">Seleccionar ubicacion en mapa</p>
            <p className="text-xs text-[var(--spot-color-muted)]">Luego confirma con el boton flotante.</p>
          </button>
          {selectedLocationLabel ? <p className="text-xs text-[var(--spot-color-success)]">Ubicacion: {selectedLocationLabel}</p> : null}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-2xl bg-[var(--spot-color-primary)] px-4 py-3 text-sm font-semibold text-white"
          >
            Continuar al formulario
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--spot-color-muted)]">Paso 2: completa la informacion principal.</p>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--spot-color-muted)]">Nombre del evento</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="spot-floating-input"
              placeholder="Nombre del evento"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--spot-color-muted)]">Descripcion</span>
            <textarea className="spot-floating-input min-h-24 resize-none" placeholder="Describe el parche" />
          </label>

          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--spot-color-muted)]">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {categoryList.map((item) => {
                const active = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`spot-filter-chip ${active ? 'spot-filter-chip-active' : ''}`}
                  >
                    {categoryEmoji[item]} {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input type="datetime-local" className="spot-floating-input" />
            <input type="datetime-local" className="spot-floating-input" />
          </div>

          <button
            type="button"
            onClick={() => setStep(3)}
            disabled={!canSend}
            className="w-full rounded-2xl bg-[var(--spot-color-primary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Enviar para revision
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <p className="text-2xl">🎉</p>
          <p className="text-lg font-bold">Tu parche fue enviado</p>
          <p className="max-w-sm text-sm text-[var(--spot-color-muted)]">Lo revisamos y te avisamos cuando este en el mapa.</p>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-2xl bg-[var(--spot-color-primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </BottomSheet>
  );
}
