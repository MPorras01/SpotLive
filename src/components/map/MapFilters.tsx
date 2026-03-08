'use client';

import type { EventCategory, EventStatus } from '@spotlive/types';

import { useMapStore } from '@/stores/mapStore';

const statuses: EventStatus[] = ['live', 'approved', 'pending', 'finished'];
const categories: Array<EventCategory | 'all'> = ['all', 'music', 'party', 'sports', 'art', 'market', 'food', 'other'];

export function MapFilters() {
  const searchTerm = useMapStore((state) => state.searchTerm);
  const selectedStatuses = useMapStore((state) => state.selectedStatuses);
  const selectedCategory = useMapStore((state) => state.selectedCategory);
  const showAlerts = useMapStore((state) => state.showAlerts);
  const setSearchTerm = useMapStore((state) => state.setSearchTerm);
  const toggleStatus = useMapStore((state) => state.toggleStatus);
  const setSelectedCategory = useMapStore((state) => state.setSelectedCategory);
  const setShowAlerts = useMapStore((state) => state.setShowAlerts);
  const resetFilters = useMapStore((state) => state.resetFilters);

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4 text-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por evento o lugar"
          className="h-10 rounded-md border border-gray-300 px-3 outline-none ring-primary focus:ring-2"
        />
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value as EventCategory | 'all')}
          className="h-10 rounded-md border border-gray-300 px-3 outline-none ring-primary focus:ring-2"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas las categorias' : category}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetFilters}
          className="h-10 rounded-md border border-gray-300 px-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Limpiar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((status) => {
          const isActive = selectedStatuses.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          );
        })}

        <label className="ml-auto inline-flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            checked={showAlerts}
            onChange={(event) => setShowAlerts(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Mostrar alertas
        </label>
      </div>
    </div>
  );
}
