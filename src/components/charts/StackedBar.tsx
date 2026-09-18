import { fmt, pct } from './chartKit';

export interface Segment {
  label: string;
  value: number;
  color: string;
}

/**
 * One bar split into parts that sum to the whole: male/female, cash/non-cash,
 * remitted/retained.
 *
 * Percentages are printed under the bar as well as drawn, because a reader
 * comparing two of these across a page cannot eyeball a 3-point difference.
 */
export default function StackedBar({
  name,
  segments,
  format = fmt,
  showPct = true,
  height = 'h-8',
}: {
  name?: string;
  segments: Segment[];
  format?: (n: number) => string;
  showPct?: boolean;
  height?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total <= 0) return null;

  return (
    <div className="border-b border-gray-200 py-4">
      {name ? (
        <div className="mb-2 font-semibold text-gray-900">{name}</div>
      ) : null}
      <div className={`flex ${height} gap-0.5 overflow-hidden rounded-sm`}>
        {segments.map(s => (
          <span
            key={s.label}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: s.color,
            }}
            title={`${s.label} — ${format(s.value)} (${pct(s.value, total)}%)`}
          />
        ))}
      </div>
      {showPct ? (
        <div className="mt-2 flex justify-between font-mono text-xs tabular-nums text-gray-500">
          {segments.map(s => (
            <span key={s.label}>
              {format(s.value)} {s.label.toLowerCase()} &middot;{' '}
              {pct(s.value, total)}%
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
