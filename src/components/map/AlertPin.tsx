interface AlertPinProps {
  label?: string;
}

export function AlertPin({ label = 'Alerta' }: AlertPinProps) {
  return <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">{label}</span>;
}
