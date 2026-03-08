import { Crosshair, Filter, Minus, Plus, SlidersHorizontal } from 'lucide-react';

import { SearchBar } from '@/components/map/SearchBar';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'event' | 'place';
}

interface MapControlsProps {
  searchQuery: string;
  searchOpen: boolean;
  searchResults: SearchResultItem[];
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchResult: (id: string, type: 'event' | 'place') => void;
  onOpenFilters: () => void;
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenReport: () => void;
}

export function MapControls({
  searchQuery,
  searchOpen,
  searchResults,
  onSearchChange,
  onSearchFocus,
  onSearchResult,
  onOpenFilters,
  onLocate,
  onZoomIn,
  onZoomOut,
  onOpenReport,
}: MapControlsProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-between p-4">
        <div className="pointer-events-auto space-y-2">
          <div className="spot-floating-panel inline-flex px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--spot-color-text)]">
            SpotLive
          </div>
          <SearchBar
            query={searchQuery}
            isExpanded={searchOpen}
            results={searchResults}
            onChange={onSearchChange}
            onFocus={onSearchFocus}
            onSelectResult={onSearchResult}
          />
        </div>

        <div className="pointer-events-auto flex flex-col gap-2">
          <button type="button" onClick={onOpenFilters} className="spot-circle-btn" aria-label="Filtros">
            <SlidersHorizontal size={18} />
          </button>
          <button type="button" onClick={onLocate} className="spot-circle-btn" aria-label="Mi ubicacion">
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-32 right-4 z-50 flex flex-col gap-2">
        <button type="button" onClick={onZoomIn} className="spot-circle-btn" aria-label="Zoom in">
          <Plus size={18} />
        </button>
        <button type="button" onClick={onZoomOut} className="spot-circle-btn" aria-label="Zoom out">
          <Minus size={18} />
        </button>
        <button type="button" onClick={onOpenReport} className="spot-fab-btn" aria-label="Reportar">
          <Filter size={18} />
          <span>+ Reportar</span>
        </button>
      </div>
    </>
  );
}
