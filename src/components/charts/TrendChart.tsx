import {
  CHROME,
  areaPath,
  frame as makeFrame,
  linear,
  niceTicks,
  path,
  fmt,
} from './chartKit';
import type { SeriesDef } from './chartKit';

export interface TrendPoint {
  x: number;
  /** null means no figure published for that x, and is drawn as a gap. */
  y: number | null;
}

export interface TrendSeries extends SeriesDef {
  points: TrendPoint[];
}

/**
 * A quantity over time: appropriations against obligations, revenue against
 * target, a programme's share year by year.
 *
 * Null handling is the point of this component. Twenty-five of the PSC's own
 * transparency links are dead, so several years genuinely have no document. The
 * line BREAKS across those years rather than joining the points either side --
 * a straight segment over a gap draws a trend the record does not support, and
 * on a chart about missing public spending that would be the worst possible
 * thing to invent. Missing years are marked on the axis instead.
 */
export default function TrendChart({
  series,
  ariaLabel,
  mode = 'line',
  width = 620,
  height = 260,
  yFormat = fmt,
  xFormat = (x: number) => String(x),
  xTicks,
  domainMax,
  annotations,
  markMissing = true,
}: {
  series: TrendSeries[];
  ariaLabel: string;
  mode?: 'line' | 'area';
  width?: number;
  height?: number;
  yFormat?: (n: number) => string;
  xFormat?: (x: number) => string;
  xTicks?: number[];
  domainMax?: number;
  annotations?: { x: number; label: string }[];
  /** Tick a year where every series is null, so a gap reads as "no document". */
  markMissing?: boolean;
}) {
  const all = series.flatMap(s => s.points);
  if (!all.length) return null;

  const f = makeFrame({ w: width, h: height, l: 52, r: 12, t: 16, b: 34 });
  const xs = [...new Set(all.map(p => p.x))].sort((a, b) => a - b);
  const ys = all.map(p => p.y).filter((y): y is number => y !== null);
  if (!ys.length) return null;

  const max = domainMax ?? Math.max(...ys);
  const ticks = niceTicks(max, 4);
  const scaleMax = Math.max(max, ticks[ticks.length - 1]);

  const x = linear([xs[0], xs[xs.length - 1]], [f.l, f.w - f.r]);
  const y = linear([0, scaleMax], [f.t + f.ih, f.t]);

  const tickXs = xTicks ?? xs;
  const missing = xs.filter(v =>
    series.every(s => {
      const p = s.points.find(q => q.x === v);
      return !p || p.y === null;
    })
  );

  return (
    <svg
      viewBox={`0 0 ${f.w} ${f.h}`}
      role="img"
      aria-label={ariaLabel}
      className="w-full h-auto"
    >
      {ticks.map(t => (
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
            {yFormat(t)}
          </text>
        </g>
      ))}

      {mode === 'area'
        ? series.map(s => (
            <path
              key={`a${s.key}`}
              d={areaPath(
                s.points.map(p =>
                  p.y === null ? null : ([x(p.x), y(p.y)] as const)
                ),
                f.t + f.ih
              )}
              fill={s.color}
              fillOpacity={0.14}
            />
          ))
        : null}

      {series.map(s => (
        <path
          key={s.key}
          d={path(
            s.points.map(p =>
              p.y === null ? null : ([x(p.x), y(p.y)] as const)
            )
          )}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {series.flatMap(s =>
        s.points
          .filter(p => p.y !== null)
          .map(p => (
            <circle
              key={`${s.key}-${p.x}`}
              cx={x(p.x)}
              cy={y(p.y as number)}
              r={2.8}
              fill="#fff"
              stroke={s.color}
              strokeWidth={1.6}
            >
              <title>{`${s.label} · ${xFormat(p.x)} — ${yFormat(p.y as number)}`}</title>
            </circle>
          ))
      )}

      {markMissing
        ? missing.map(v => (
            <g key={`m${v}`}>
              <line
                x1={x(v)}
                x2={x(v)}
                y1={f.t}
                y2={f.t + f.ih}
                stroke={CHROME.grid}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <text
                x={x(v)}
                y={f.t + f.ih / 2}
                textAnchor="middle"
                fill={CHROME.axisText}
                fontSize={CHROME.axisSize}
                fontFamily={CHROME.axisFont}
                transform={`rotate(-90 ${x(v)} ${f.t + f.ih / 2})`}
              >
                no document
              </text>
            </g>
          ))
        : null}

      {annotations?.map(a => (
        <g key={`ann${a.x}`}>
          <line
            x1={x(a.x)}
            x2={x(a.x)}
            y1={f.t}
            y2={f.t + f.ih}
            stroke="var(--color-secondary-600)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={x(a.x) + 4}
            y={f.t + 9}
            fill="var(--color-secondary-600)"
            fontSize={CHROME.axisSize}
            fontFamily={CHROME.axisFont}
          >
            {a.label}
          </text>
        </g>
      ))}

      {tickXs.map(v => (
        <text
          key={`x${v}`}
          x={x(v)}
          y={f.h - f.b + 16}
          textAnchor="middle"
          fill={CHROME.axisText}
          fontSize={CHROME.axisSize}
          fontFamily={CHROME.axisFont}
        >
          {xFormat(v)}
        </text>
      ))}
    </svg>
  );
}
