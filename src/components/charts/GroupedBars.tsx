import { fmt } from './chartKit';
import type { SeriesDef } from './chartKit';

export interface GroupedRow {
  label: string;
  /** Keyed by series key. null renders no bar, which is not the same as zero. */
  values: Record<string, number | null>;
}

/**
 * Two or three bars per row, on a SHARED scale.
 *
 * The shared scale is the entire point. Normalising each series to its own
 * maximum makes every row look the same and destroys the comparison the chart
 * exists to make. `scaleMax` pins the axis explicitly; without it the largest
 * value across all series sets it.
 */
export default function GroupedBars({
  rows,
  series,
  scaleMax,
  format = fmt,
  unit,
  tooltip,
  barHeight = 'h-3',
}: {
  rows: GroupedRow[];
  series: SeriesDef[];
  /** Pin the axis, e.g. 30 when the values are percentages that never exceed it. */
  scaleMax?: number;
  format?: (n: number) => string;
  /** Noun for the tooltip, e.g. "athletes" or "%". */
  unit?: string;
  /** Full control of the hover text, when the bar value is not the whole story. */
  tooltip?: (row: GroupedRow, series: SeriesDef, value: number) => string;
  barHeight?: string;
}) {
  const all = rows.flatMap(r =>
    series
      .map(s => r.values[s.key])
      .filter((v): v is number => v !== null && v !== undefined)
  );
  const max = scaleMax ?? (all.length ? Math.max(...all) : 0);
  if (max <= 0) return null;

  return (
    <div>
      {rows.map(row => (
        <div key={row.label} className="border-b border-gray-200 py-3.5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-gray-900">{row.label}</span>
            <span className="font-mono tabular-nums text-gray-500">
              {series
                .map(s => {
                  const v = row.values[s.key];
                  return v === null || v === undefined ? '—' : format(v);
                })
                .join(' · ')}
            </span>
          </div>
          {series.map((s, i) => {
            const v = row.values[s.key];
            const suffix = unit ? ` ${unit}` : '';
            return (
              <span
                key={s.key}
                className={`block ${barHeight} overflow-hidden rounded-sm bg-gray-100${
                  i < series.length - 1 ? ' mb-1' : ''
                }`}
                title={
                  v === null || v === undefined
                    ? `${s.label} · ${row.label} — no figure published`
                    : tooltip
                      ? tooltip(row, s, v)
                      : `${s.label} · ${row.label} — ${format(v)}${suffix}`
                }
              >
                {v === null || v === undefined ? null : (
                  <span
                    className="block h-full rounded-r-sm"
                    style={{
                      width: `${Math.min(100, (v / max) * 100)}%`,
                      background: s.color,
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
