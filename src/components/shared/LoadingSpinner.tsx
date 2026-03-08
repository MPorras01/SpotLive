export function LoadingSpinner() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-500" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      Cargando...
    </div>
  );
}
