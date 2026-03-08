'use client';

import { BottomSheet } from '@/components/shared/BottomSheet';
import type { UiCategory } from '@/components/map/mockMapData';

export interface FilterState {
  category: 'all' | UiCategory;
  onlyLive: boolean;
  onlyAdults: boolean;
  allowsMinors: boolean;
  petFriendly: boolean;
  bikeOrSkate: boolean;
}

interface FilterSheetProps {
  isOpen: boolean;
  value: FilterState;
  onChange: (next: FilterState) => void;
  onClose: () => void;
}

const categories: Array<{ value: FilterState['category']; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'music', label: 'Musica' },
  { value: 'party', label: 'Fiesta' },
  { value: 'sports', label: 'Skate' },
  { value: 'art', label: 'Arte' },
  { value: 'market', label: 'Mercado' },
  { value: 'parche', label: 'Parche' },
];

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full p-0.5 transition ${checked ? 'bg-[var(--spot-color-primary)]' : 'bg-gray-700'}`}
      >
        <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

export function FilterSheet({ isOpen, value, onChange, onClose }: FilterSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapPoints={[62]} initialSnap={0} title="Filtros">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--spot-color-muted)]">Categorias</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = value.category === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => onChange({ ...value, category: category.value })}
                  className={`spot-filter-chip ${active ? 'spot-filter-chip-active' : ''}`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <ToggleRow label="Solo eventos en vivo" checked={value.onlyLive} onChange={(next) => onChange({ ...value, onlyLive: next })} />
          <ToggleRow label="Solo lugares 18+" checked={value.onlyAdults} onChange={(next) => onChange({ ...value, onlyAdults: next })} />
          <ToggleRow label="Permite menores" checked={value.allowsMinors} onChange={(next) => onChange({ ...value, allowsMinors: next })} />
          <ToggleRow label="Permite mascotas" checked={value.petFriendly} onChange={(next) => onChange({ ...value, petFriendly: next })} />
          <ToggleRow label="Bicicleta/Skate friendly" checked={value.bikeOrSkate} onChange={(next) => onChange({ ...value, bikeOrSkate: next })} />
        </div>
      </div>
    </BottomSheet>
  );
}
