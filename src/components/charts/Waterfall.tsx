import {
  CHROME,
  frame as makeFrame,
  linear,
  niceTicks,
  peso,
} from './chartKit';

export interface WaterfallStep {
  label: string;
  value: number;
  /**
   * 'start' and 'total' sit on the baseline; 'delta' floats from the running
   * total. A negative delta is a deduction.
   */
  kind: 'start' | 'delta' | 'total';
  note?: string;
}

/** Greedy word wrap to a pixel width, at the axis font size. */
function wrap(label: string, maxWidth: number): string[] {
  const perChar = CHROME.axisSize * 0.58;
  const max = Math.max(6, Math.floor(maxWidth / perChar));
  const lines: string[] = [];
  let line = '';
  for (const word of label.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/**
 * The budget funnel.
 *
 * FAR No. 1's structure is literally a waterfall -- appropriation, plus or
 * minus adjustments, of which some is released as allotment, of which some is
 * obligated, of which some is actually disbursed, leaving three named
 * remainders. Drawn as separate bars those quantities look like five unrelated
 * numbers; drawn as a waterfall you can see that each one is carved out of the
 * one before, which is the single most useful thing to understand about how an
 * agency's money moves.
 */
export default function Waterfall({
  steps,
  ariaLabel,
  width = 680,
  height = 300,
  format = (n: number) => peso(n, { compact: true }),
  increaseColor = 'var(--color-primary-600)',
  decreaseColor = 'var(--color-accent-600)',
  totalColor = 'var(--color-gray-400)',
}: {
  steps: WaterfallStep[];
  ariaLabel: string;
  width?: number;
  height?: number;
  format?: (n: number) => string;
  increaseColor?: string;
  decreaseColor?: string;
  totalColor?: string;
}) {
  if (!steps.length) return null;

  const f = makeFrame({ w: width, h: height, l: 60, r: 12, t: 16, b: 52 });

  // Walk the steps once to find where each bar starts and ends. A 'start' or
  // 'total' resets to the baseline; a 'delta' floats from the running total.
  const bars: (WaterfallStep & { from: number; to: number })[] = [];
  for (const s of steps) {
    const from = s.kind === 'delta' ? (bars[bars.length - 1]?.to ?? 0) : 0;
    bars.push({ ...s, from, to: from + s.value });
  }

  const max = Math.max(...bars.flatMap(b => [b.from, b.to]), 0);
  const ticks = niceTicks(max, 4);
  const scaleMax = Math.max(max, ticks[ticks.length - 1]);
  const y = linear([0, scaleMax], [f.t + f.ih, f.t]);

  const step = f.iw / bars.length;
  const bw = Math.max(8, step * 0.62);

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
            {format(t)}
          </text>
        </g>
      ))}

      {bars.map((b, i) => {
        const cx = f.l + i * step + step / 2;
        const top = y(Math.max(b.from, b.to));
        const bottom = y(Math.min(b.from, b.to));
        const h = Math.max(1, bottom - top);
        const fill =
          b.kind === 'start' || b.kind === 'total'
            ? totalColor
            : b.value < 0
              ? decreaseColor
              : increaseColor;

        return (
          <g key={b.label}>
            {/* Connector to the next bar, so the eye follows the carve-out. */}
            {i < bars.length - 1 && bars[i + 1].kind === 'delta' ? (
              <line
                x1={cx + bw / 2}
                x2={f.l + (i + 1) * step + step / 2 - bw / 2}
                y1={y(b.to)}
                y2={y(b.to)}
                stroke={CHROME.axisText}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            ) : null}
            <rect
              x={cx - bw / 2}
              y={top}
              width={bw}
              height={h}
              rx={1.5}
              fill={fill}
            >
              <title>
                {`${b.label} — ${format(b.value)}${b.note ? ` · ${b.note}` : ''}`}
              </title>
            </rect>
            <text
              x={cx}
              y={top - 5}
              textAnchor="middle"
              fill="#4b5563"
              fontSize={9.5}
              fontFamily={CHROME.axisFont}
            >
              {format(b.value)}
            </text>
            {/* Horizontal and wrapped, not angled. A waterfall has few bars and
                the label IS the explanation, so it has to be readable; rotating
                it ran the leftmost label off the side of the chart. */}
            {wrap(b.label, step).map((line, li) => (
              <text
                key={line + li}
                x={cx}
                y={f.t + f.ih + 14 + li * 11}
                textAnchor="middle"
                fill={CHROME.axisText}
                fontSize={CHROME.axisSize}
                fontFamily={CHROME.axisFont}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
