import { fmt, pct } from './chartKit';

export interface BarRow {
  label: string;
  value: number;
}

/**
 * Ranked horizontal bars.
 *
 * Bars are scaled to the largest row, not to the total, because the question a
 * ranked list answers is "how do these compare to each other". The share of the
 * whole goes in the tooltip, where `total` is supplied.
 */
export default function BarList({
  rows,
  color,
  total,
  format = fmt,
  valueLabel,
}: {
  rows: BarRow[] | [string, number][];
  color: string;
  /** Denominator for the share shown on hover. Omit to show the value alone. */
  total?: number;
  format?: (n: number) => string;
  /** Noun for the tooltip, e.g. "athletes". */
  valueLabel?: string;
}) {
  const normalized: BarRow[] = rows.map(r =>
    Array.isArray(r) ? { label: r[0], value: r[1] } : r
  );
  if (!normalized.length) return null;

  const max = Math.max(...normalized.map(r => r.value));

  return (
    <ul className="mt-5 space-y-1.5">
      {normalized.map(({ label, value }) => {
        const unit = valueLabel ? ` ${valueLabel}` : '';
        const share = total ? ` (${pct(value, total)}%)` : '';
        return (
          <li
            key={label}
            className="grid grid-cols-[minmax(84px,132px)_1fr_auto] items-center gap-3"
            title={`${label} — ${format(value)}${unit}${share}`}
          >
            <span className="text-right text-[13px] leading-tight text-gray-600">
              {label}
            </span>
            <span className="h-4 overflow-hidden rounded-sm bg-gray-100">
              <span
                className="block h-full rounded-r-sm"
                style={{
                  width: max > 0 ? `${(value / max) * 100}%` : '0%',
                  background: color,
                }}
              />
            </span>
            <span className="min-w-[46px] text-right font-mono text-xs tabular-nums text-gray-500">
              {format(value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
