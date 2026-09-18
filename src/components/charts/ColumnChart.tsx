import { CHROME, fmt, frame as makeFrame, niceTicks } from './chartKit';

export interface ColumnDatum {
  key: string | number;
  /** Axis label. Falls back to `key`. */
  label?: string;
  value: number;
}

/**
 * Vertical columns over a categorical axis: an age histogram, a utilisation
 * rate per year, a count per quarter.
 *
 * Generalised from the age histogram on the participation page, so the defaults
 * reproduce it exactly.
 */
export default function ColumnChart({
  data,
  color,
  ariaLabel,
  axisLabel,
  yFormat = fmt,
  tooltip,
  height = 210,
  width = 460,
  labelEvery,
  refLine,
  domainMax,
  tickMode = 'nice',
}: {
  data: ColumnDatum[];
  color: string;
  ariaLabel: string;
  /** Corner caption, e.g. "AGE" or "FISCAL YEAR". */
  axisLabel?: string;
  yFormat?: (n: number) => string;
  tooltip?: (d: ColumnDatum) => string;
  height?: number;
  width?: number;
  /** Label every nth column. Auto-thins when there are many. */
  labelEvery?: number;
  /** Horizontal reference, e.g. 100% on a utilisation chart. */
  refLine?: { value: number; label?: string; color?: string };
  /** Pin the y-axis so several charts share a scale. */
  domainMax?: number;
  /**
   * 'nice' rounds the axis to readable tick values, which is right for money
   * and rates. 'data' puts ticks at 0, half and the exact maximum and scales
   * bars to the data -- the original age-histogram behaviour, kept so that
   * chart did not change when it moved into this component.
   */
  tickMode?: 'nice' | 'data';
}) {
  if (!data.length) return null;

  const f = makeFrame({ w: width, h: height });
  const dataMax = Math.max(...data.map(d => d.value), refLine?.value ?? 0);
  const max = domainMax ?? dataMax;
  const bw = f.iw / data.length;
  const ticks =
    tickMode === 'data' ? [0, Math.round(max / 2), max] : niceTicks(max, 3);
  const scaleMax =
    tickMode === 'data' ? max : Math.max(max, ticks[ticks.length - 1]);
  const y = (v: number) => f.t + f.ih - (v / scaleMax) * f.ih;

  const step =
    labelEvery ?? (data.length > 20 ? Math.ceil(data.length / 7) : 2);

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
            x={f.l - 7}
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

      {data.map((d, i) => {
        const h = (d.value / scaleMax) * f.ih;
        return (
          <rect
            key={d.key}
            x={f.l + i * bw + 0.8}
            y={f.t + f.ih - h}
            width={Math.max(1.4, bw - 1.6)}
            height={Math.max(h, 0.8)}
            rx={1.5}
            fill={color}
          >
            <title>
              {tooltip
                ? tooltip(d)
                : `${d.label ?? d.key} — ${yFormat(d.value)}`}
            </title>
          </rect>
        );
      })}

      {refLine ? (
        <g>
          <line
            x1={f.l}
            x2={f.w - f.r}
            y1={y(refLine.value)}
            y2={y(refLine.value)}
            stroke={refLine.color ?? 'var(--color-secondary-600)'}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {refLine.label ? (
            <text
              x={f.w - f.r}
              y={y(refLine.value) - 4}
              textAnchor="end"
              fill={refLine.color ?? 'var(--color-secondary-600)'}
              fontSize={CHROME.axisSize}
              fontFamily={CHROME.axisFont}
            >
              {refLine.label}
            </text>
          ) : null}
        </g>
      ) : null}

      {data.map((d, i) =>
        i % step === 0 || i === data.length - 1 ? (
          <text
            key={`l${d.key}`}
            x={f.l + i * bw + bw / 2}
            y={f.h - f.b + 15}
            textAnchor="middle"
            fill={CHROME.axisText}
            fontSize={CHROME.axisSize}
            fontFamily={CHROME.axisFont}
          >
            {d.label ?? d.key}
          </text>
        ) : null
      )}

      {axisLabel ? (
        <text
          x={f.l}
          y={f.h - 3}
          fill={CHROME.axisText}
          fontSize={CHROME.axisSize}
          fontFamily={CHROME.axisFont}
          letterSpacing="0.08em"
        >
          {axisLabel}
        </text>
      ) : null}
    </svg>
  );
}
