interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'event' | 'place';
}

interface SearchBarProps {
  query: string;
  isExpanded: boolean;
  results: SearchResultItem[];
  onChange: (value: string) => void;
  onFocus: () => void;
  onSelectResult: (id: string, type: 'event' | 'place') => void;
}

export function SearchBar({ query, isExpanded, results, onChange, onFocus, onSelectResult }: SearchBarProps) {
  return (
    <div className="relative w-[min(78vw,360px)]">
      <input
        value={query}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder="¿Dónde está el parche?"
        className="spot-floating-input"
      />
      {isExpanded ? (
        <div className="spot-floating-panel mt-2 max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-xs text-[var(--spot-color-muted)]">No hay resultados por ahora.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => onSelectResult(result.id, result.type)}
                    className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                  >
                    <p className="text-sm font-semibold text-[var(--spot-color-text)]">{result.title}</p>
                    <p className="text-xs text-[var(--spot-color-muted)]">{result.subtitle}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
