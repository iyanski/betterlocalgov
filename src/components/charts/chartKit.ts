/**
 * Shared vocabulary for every chart on the site: colour, scale, formatting.
 *
 * There is no charting library here, and that is deliberate. Every mark is
 * hand-written SVG or a CSS-width bar, which keeps the charts inside the site's
 * own typographic system and keeps the bundle honest. What a library would give
 * us for free -- scales, ticks, a colour ramp -- lives in this file instead.
 */

/**
 * Series colours are theme tokens referenced as CSS custom properties, because
 * bar widths are inline styles anyway and this keeps a chart's colour in step
 * with the rest of the site.
 *
 * Only primary-600, accent-600 and secondary-600 have been checked for
 * colour-vision separation (primary-600 vs accent-600 measures deltaE 29 under
 * protanopia). A fourth categorical colour would quietly break that guarantee,
 * so `CategoricalSeries` below caps a chart at three. More categories than that
 * is a signal to use small multiples or a heat strip, not more hues.
 */
export const SERIES = {
  primary: 'var(--color-primary-600)',
  accent: 'var(--color-accent-600)',
  secondary: 'var(--color-secondary-600)',
  muted: 'var(--color-gray-400)',
  track: 'var(--color-gray-100)',
} as const;

/**
 * Semantic roles for money, so a colour means the same thing on every page:
 * obligated is always primary, unpaid is always accent, and a reader who learns
 * the budget page can read the procurement page.
 */
export const MONEY = {
  appropriated: SERIES.muted,
  allotted: 'var(--color-primary-300)',
  obligated: SERIES.primary,
  // Orange, not a second blue. Obligated and disbursed are nested quantities,
  // so a light/dark pair of the same hue is semantically tempting -- but on a
  // line chart primary-600 against primary-800 is two dark blue lines a couple
  // of pixels apart, and the gap between committing money and paying it out is
  // the entire point of the budget page.
  disbursed: SERIES.secondary,
  unreleased: SERIES.accent,
  unobligated: 'var(--color-gray-300)',
  unpaid: 'var(--color-primary-300)',
  target: SERIES.muted,
  actual: SERIES.primary,
} as const;

/** Chart chrome. Deliberately not theme tokens: gridlines should not restyle. */
export const CHROME = {
  grid: '#e5e7eb',
  axisText: '#9ca3af',
  axisFont: 'ui-monospace, monospace',
  axisSize: 9.5,
} as const;

/** A chart may carry at most three categorical series -- see SERIES above. */
export type CategoricalSeries<T> =
  readonly [T] | readonly [T, T] | readonly [T, T, T];

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------- formatting

export const fmt = (n: number) => n.toLocaleString('en-US');

export const pct = (n: number, of: number, decimals = 1) =>
  ((n / of) * 100).toFixed(decimals);

/**
 * Pesos. Government figures run to eleven digits, which no axis can carry, so
 * `compact` abbreviates to millions or billions -- but only on axes and tiles.
 * A figure quoted in prose or a table keeps every centavo.
 */
export function peso(
  n: number | null,
  opts: { compact?: boolean; decimals?: number; sign?: boolean } = {}
): string {
  if (n === null || Number.isNaN(n)) return '—';
  const { compact = false, decimals, sign = false } = opts;
  // The sign belongs outside the currency symbol: -P145M, not P-145M.
  const prefix = n < 0 ? '\u2212' : sign && n > 0 ? '+' : '';
  n = Math.abs(n);

  if (compact) {
    const abs = Math.abs(n);
    const [div, suffix] =
      abs >= 1e9
        ? [1e9, 'B']
        : abs >= 1e6
          ? [1e6, 'M']
          : abs >= 1e3
            ? [1e3, 'K']
            : [1, ''];
    const value = n / div;
    const d =
      decimals ?? (Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2);
    return `${prefix}₱${value.toFixed(d)}${suffix}`;
  }

  return `${prefix}₱${n.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? 2,
    maximumFractionDigits: decimals ?? 2,
  })}`;
}

// -------------------------------------------------------------------- scales

export interface Frame {
  w: number;
  h: number;
  l: number;
  r: number;
  t: number;
  b: number;
  iw: number;
  ih: number;
}

/** Plot frame with the inner drawing area precomputed. */
export function frame(p: Partial<Frame> = {}): Frame {
  const w = p.w ?? 460;
  const h = p.h ?? 210;
  const l = p.l ?? 38;
  const r = p.r ?? 8;
  const t = p.t ?? 14;
  const b = p.b ?? 32;
  return { w, h, l, r, t, b, iw: w - l - r, ih: h - t - b };
}

/** Linear scale. A zero-width domain maps everything to the range start. */
export function linear(
  domain: readonly [number, number],
  range: readonly [number, number]
): (v: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => r0;
  return v => r0 + ((v - d0) / span) * (r1 - r0);
}

/** Evenly spaced bands, as for a column chart. */
export function band(
  n: number,
  range: readonly [number, number],
  pad = 0.15
): { at: (i: number) => number; width: number; step: number } {
  const [r0, r1] = range;
  const step = n > 0 ? (r1 - r0) / n : 0;
  const width = Math.max(1, step * (1 - pad));
  return { at: i => r0 + i * step + (step - width) / 2, width, step };
}

/** Round, human-readable tick values covering 0..max. */
export function niceTicks(max: number, count = 3): number[] {
  if (!Number.isFinite(max) || max <= 0) return [0];
  const rawStep = max / Math.max(1, count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step)
    ticks.push(Number(v.toFixed(10)));
  if (ticks[ticks.length - 1] < max)
    ticks.push(Number((ticks[ticks.length - 1] + step).toFixed(10)));
  return ticks;
}

/**
 * An SVG path through points, skipping nulls.
 *
 * Null means "no document for that year", which happens often here: 25 of the
 * PSC's own transparency links are dead. The line BREAKS across a gap rather
 * than bridging it -- drawing a straight segment over a missing year would
 * invent a trend that nothing supports.
 */
export function path(
  points: readonly (readonly [number, number] | null)[]
): string {
  let d = '';
  let pen = false;
  for (const p of points) {
    if (!p) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    pen = true;
  }
  return d.trim();
}

/** Closes a line path down to the baseline to make an area. */
export function areaPath(
  points: readonly (readonly [number, number] | null)[],
  baseline: number
): string {
  const runs: (readonly [number, number])[][] = [];
  let run: (readonly [number, number])[] = [];
  for (const p of points) {
    if (!p) {
      if (run.length) runs.push(run);
      run = [];
    } else run.push(p);
  }
  if (run.length) runs.push(run);

  return runs
    .filter(r => r.length > 1)
    .map(r => {
      const head = r
        .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
        .join('');
      return `${head}L${r[r.length - 1][0].toFixed(2)} ${baseline.toFixed(2)}L${r[0][0].toFixed(2)} ${baseline.toFixed(2)}Z`;
    })
    .join(' ');
}
