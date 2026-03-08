import type { UiCategory } from '@/components/map/mockMapData';

export type CategoryFilter = 'live' | UiCategory | 'places';

interface CategoryBarProps {
  selected: CategoryFilter | null;
  onSelect: (category: CategoryFilter | null) => void;
}

const categoryItems: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'live', label: '🔴 En vivo' },
  { id: 'music', label: '🎵 Musica' },
  { id: 'party', label: '🎉 Fiesta' },
  { id: 'sports', label: '🛹 Skate' },
  { id: 'art', label: '🎨 Arte' },
  { id: 'parche', label: '🍺 Parche' },
  { id: 'places', label: '📍 Lugares' },
];

export function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 pb-6 pt-16">
      <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent" />
      <div className="relative mx-auto flex w-full max-w-4xl gap-2 overflow-x-auto px-4 pb-2">
        {categoryItems.map((item) => {
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(isActive ? null : item.id)}
              className={`spot-filter-chip whitespace-nowrap ${isActive ? 'spot-filter-chip-active' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
