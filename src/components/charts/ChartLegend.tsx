export interface LegendItem {
  label: string;
  color: string;
}

/** Swatch row. Charts carry at most three series, so this stays one line. */
export default function ChartLegend({
  items,
  className = 'mb-4',
}: {
  items: LegendItem[];
  className?: string;
}) {
  return (
    <div
      className={`${className} flex flex-wrap gap-5 font-mono text-xs uppercase tracking-wider text-gray-600`}
    >
      {items.map(it => (
        <span key={it.label} className="flex items-center gap-2">
          <i
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
