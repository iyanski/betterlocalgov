/**
 * Parsing and repair of money and count tokens read off a scanned government
 * form.
 *
 * Two rules govern everything here:
 *
 *  1. Blank is not zero. A FAR distinguishes a cell left empty from a printed
 *     0.00, and conflating them would silently invent facts. Blank parses to
 *     null.
 *  2. Nothing is silently coerced. A token that does not look like money is
 *     flagged, never guessed at. Character repairs are attempted only when the
 *     repaired value makes an arithmetic identity pass, and every repair that
 *     is accepted is recorded in the row's provenance.
 */

/**
 * Peso figures on these forms always carry two decimal places, which is a
 * strong, cheap invariant: a token that fails this is an OCR problem, not a
 * small number.
 */
export const MONEY_RE = /^\(?-?[\d,]*\d(?:\.\d{2})\)?$/;

/** Counts (athletes, events, LGUs) appear on BAR No. 1 without decimals. */
export const COUNT_RE = /^\(?-?[\d,]*\d(?:\.\d+)?\)?$/;

/** Tokens that mean "nothing here" rather than "zero". */
const BLANK_TOKENS = new Set([
  '',
  '-',
  '--',
  '—',
  '–',
  'n/a',
  'na',
  'N/A',
  '.',
  '·',
]);

/**
 * Confusions Vision actually makes on this typeface, most-likely first. Only
 * applied under an arithmetic check -- see repairToward().
 */
const CONFUSIONS = [
  ['O', '0'],
  ['o', '0'],
  ['D', '0'],
  ['Q', '0'],
  ['l', '1'],
  ['I', '1'],
  ['|', '1'],
  ['i', '1'],
  ['S', '5'],
  ['s', '5'],
  ['B', '8'],
  ['Z', '2'],
  ['G', '6'],
  ['T', '7'],
  ['g', '9'],
  ['q', '9'],
];

const stripSpaces = s => String(s ?? '').replace(/[\s ​-‍]/g, '');

/**
 * @typedef {object} ParsedNumber
 * @property {number|null} value   parsed value; null for a blank cell
 * @property {boolean} ok          false when the token is not number-shaped
 * @property {string} raw          the token exactly as OCR read it
 * @property {'blank'|'money'|'count'|'unparsed'} form
 */

/**
 * Parse a money token. Accounting parentheses mean negative.
 * @param {string} raw
 * @param {{ allowCount?: boolean }} [opts]
 * @returns {ParsedNumber}
 */
export function parseMoney(raw, opts = {}) {
  const original = String(raw ?? '');
  const t = stripSpaces(original);

  if (BLANK_TOKENS.has(t) || BLANK_TOKENS.has(t.toLowerCase())) {
    return { value: null, ok: true, raw: original, form: 'blank' };
  }

  const negative = /^\(.*\)$/.test(t) || t.startsWith('-');
  const body = t.replace(/^\(|\)$/g, '').replace(/^-/, '');

  const re = opts.allowCount ? COUNT_RE : MONEY_RE;
  if (!re.test(body)) {
    return { value: null, ok: false, raw: original, form: 'unparsed' };
  }

  // A comma every three digits is the only grouping these forms use; anything
  // else means the decimal point and a separator got confused.
  const digits = body.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(digits)) {
    return { value: null, ok: false, raw: original, form: 'unparsed' };
  }

  const value = Number(digits) * (negative ? -1 : 1);
  if (!Number.isFinite(value)) {
    return { value: null, ok: false, raw: original, form: 'unparsed' };
  }

  return {
    value,
    ok: true,
    raw: original,
    form: opts.allowCount && !/\.\d{2}$/.test(body) ? 'count' : 'money',
  };
}

/**
 * Grouping check: "1,234,567.00" is well-formed, "1,23,4567.00" is not. A token
 * that parses but is badly grouped is a strong signal that a digit was dropped
 * or doubled.
 */
export function hasValidGrouping(raw) {
  const t = stripSpaces(raw)
    .replace(/^\(|\)$/g, '')
    .replace(/^-/, '');
  if (!t.includes(',')) return true;
  const [intPart] = t.split('.');
  return /^\d{1,3}(,\d{3})+$/.test(intPart);
}

/**
 * Candidate readings of a token, cheapest edit first. Used by the repair path:
 * a candidate is only ever accepted because it made an identity balance, never
 * because it looked nicer.
 *
 * @param {string} raw
 * @param {number} [maxEdits]
 * @returns {{ text: string, value: number, repairs: string[] }[]}
 */
export function repairCandidates(raw, maxEdits = 2) {
  const original = stripSpaces(raw);
  const seen = new Map();
  const out = [];

  const consider = (text, repairs) => {
    if (seen.has(text)) return;
    seen.set(text, true);
    const p = parseMoney(text);
    // A repair may not invent an implausible figure. The national budget is
    // measured in trillions, so anything past 13 integer digits is not a
    // misread peso amount -- it is two cells welded together, and "fixing" it
    // would fabricate a number rather than recover one.
    if (
      p.ok &&
      p.value !== null &&
      hasValidGrouping(text) &&
      Math.abs(p.value) < 1e13
    ) {
      out.push({ text, value: p.value, repairs });
    }
  };

  consider(original, []);

  const expand = (text, repairs, depth) => {
    if (depth >= maxEdits) return;
    for (let i = 0; i < text.length; i++) {
      for (const [from, to] of CONFUSIONS) {
        if (text[i] !== from) continue;
        const next = text.slice(0, i) + to + text.slice(i + 1);
        const trail = [...repairs, `${from}->${to}@${i}`];
        consider(next, trail);
        expand(next, trail, depth + 1);
      }
    }
  };

  expand(original, [], 0);

  // A stray separator is the other common failure: "1,234.567.00".
  if ((original.match(/\./g) || []).length > 1) {
    const fixed = original.replace(/\.(?=.*\.)/g, ',');
    consider(fixed, ['.->,']);
  }

  return out.sort((a, b) => a.repairs.length - b.repairs.length);
}

/** Centavo-level comparison, with an explicit rounding band. */
export function closeEnough(a, b, tolerance = 0.005) {
  if (a === null || b === null) return false;
  return Math.abs(a - b) <= tolerance;
}

/**
 * Sum that propagates unknowns honestly: if any addend is null the total is
 * null, because a missing figure is not a zero.
 */
export function strictSum(values) {
  let total = 0;
  for (const v of values) {
    if (v === null || v === undefined) return null;
    total += v;
  }
  // Float drift over 24 columns of centavos is real; snap to centavos.
  return Math.round(total * 100) / 100;
}

/**
 * Digit count, used to spot a figure that is an order of magnitude away from
 * every other value in its column -- usually a dropped or doubled digit.
 */
export function digitCount(value) {
  if (value === null) return null;
  return Math.abs(Math.trunc(value)).toString().length;
}
