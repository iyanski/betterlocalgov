import { CHROME, frame as makeFrame, linear, niceTicks, fmt } from './chartKit';
import type { SeriesDef } from './chartKit';

export interface ColumnGroup {
  label: string;
  /** Keyed by series key. null is a missing figure, not a zero. */
  values: Record<string, number | null>;
}

/**
 * Composition within a total, per period: PS/MOOE/CO across thirteen budgets,
 * revenue by source, procurement by mode.
 *
 * `stack="expand"` normalises each column to 100%, which answers "what is the
 * mix" instead of "how big is it". The two questions want different charts and
 * this is the same data, so it is a prop rather than a second component -- a
 * page can offer the toggle.
 *
 * At most three series, per the colour-vision rule in chartKit.
 */
export default function StackedColumns({
  groups,
  series,
  ariaLabel,
  stack = 'absolute',
  width = 620,
  height = 280,
  yFormat = fmt,
  refLine,
}: {
  groups: ColumnGroup[];
  series: SeriesDef[];
  ariaLabel: string;
  stack?: 'absolute' | 'expand';
  width?: number;
  height?: number;
  yFormat?: (n: number) => string;
  refLine?: { value: number; label?: string };
}) {
  if (!groups.length || !series.length) return null;

  const f = makeFrame({ w: width, h: height, l: 54, r: 12, t: 16, b: 38 });

  const totalOf = (g: ColumnGroup) =>
    series.reduce((a, s) => a + (g.values[s.key] ?? 0), 0);

  const max =
    stack === 'expand'
      ? 100
      : Math.max(...groups.map(totalOf), refLine?.value ?? 0);
  const ticks = niceTicks(max, 4);
  const scaleMax =
    stack === 'expand' ? 100 : Math.max(max, ticks[ticks.length - 1]);
  const y = linear([0, scaleMax], [f.t + f.ih, f.t]);
  const shown = stack === 'expand' ? [0, 25, 50, 75, 100] : ticks;

  const step = f.iw / groups.length;
  const bw = Math.max(6, step * 0.68);

  return (
    <svg
      viewBox={`0 0 ${f.w} ${f.h}`}
      role="img"
      aria-label={ariaLabel}
      className="w-full h-auto"
    >
      {shown.map(t => (
        <g key={t}>
          <line
            x1={f.l}
            x2={f.w - f.r}
            y1={y(t)}
            y2={y(t)}
            stroke={CHROME.grid}
            strokeWidth={1}
          />
          <text
            x={f.l - 8}
            y={y(t) + 3.5}
            textAnchor="end"
            fill={CHROME.axisText}
            fontSize={CHROME.axisSize}
            fontFamily={CHROME.axisFont}
          >
            {stack === 'expand' ? `${t}%` : yFormat(t)}
          </text>
        </g>
      ))}

      {groups.map((g, i) => {
        const cx = f.l + i * step + step / 2;
        const total = totalOf(g);
        // A column with nothing in it is a year with no document; leave it
        // empty rather than drawing a zero-height bar that reads as "zero".
        if (total <= 0) {
          return (
            <text
              key={g.label}
              x={cx}
              y={f.t + f.ih / 2}
              textAnchor="middle"
              fill={CHROME.axisText}
              fontSize={CHROME.axisSize}
              fontFamily={CHROME.axisFont}
              transform={`rotate(-90 ${cx} ${f.t + f.ih / 2})`}
            >
              no document
            </text>
          );
        }

        // Running offsets computed up front rather than mutated mid-render.
        const offsets: number[] = [];
        for (const s of series) {
          const raw = g.values[s.key];
          const v =
            raw === null || raw === undefined
              ? 0
              : stack === 'expand'
                ? (raw / total) * 100
                : raw;
          offsets.push((offsets[offsets.length - 1] ?? 0) + v);
        }

        return (
          <g key={g.label}>
            {series.map((s, si) => {
              const raw = g.values[s.key];
              if (raw === null || raw === undefined) return null;
              const y0 = y(offsets[si]);
              const y1 = y(si === 0 ? 0 : offsets[si - 1]);
              return (
                <rect
                  key={s.key}
                  x={cx - bw / 2}
                  y={y0}
                  width={bw}
                  height={Math.max(0.8, y1 - y0)}
                  fill={s.color}
                >
                  <title>
                    {`${s.label} · ${g.label} — ${yFormat(raw)}${
                      stack === 'expand'
                        ? ` (${((raw / total) * 100).toFixed(1)}%)`
                        : ''
                    }`}
                  </title>
                </rect>
              );
            })}
          </g>
        );
      })}

      {refLine ? (
        <line
          x1={f.l}
          x2={f.w - f.r}
          y1={y(refLine.value)}
          y2={y(refLine.value)}
          stroke="var(--color-secondary-600)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ) : null}

      {groups.map((g, i) => (
        <text
          key={`l${g.label}`}
          x={f.l + i * step + step / 2}
          y={f.h - f.b + 16}
          textAnchor="middle"
          fill={CHROME.axisText}
          fontSize={CHROME.axisSize}
          fontFamily={CHROME.axisFont}
        >
          {g.label}
        </text>
      ))}
    </svg>
  );
}
