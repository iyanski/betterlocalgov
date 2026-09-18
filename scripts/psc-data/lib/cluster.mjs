/**
 * Turning a bag of OCR word boxes back into a table.
 *
 * The load-bearing observation: financial columns are RIGHT-aligned. Every
 * figure in a column shares a right edge to within a pixel or two, while the
 * left edge wanders with the magnitude of the number. Clustering on the centre
 * -- the obvious thing, and what most table extractors do -- smears adjacent
 * columns into each other as soon as one column holds both 0.00 and
 * 1,156,452,000.00. Clustering on x1 does not.
 *
 * Row grouping is the easy direction: text baselines are well separated, so a
 * gap threshold relative to the median glyph height is enough.
 */

/**
 * One-dimensional agglomerative clustering over sorted positions.
 * Merges neighbours while their gap stays under `tolerance`.
 *
 * @param {number[]} values
 * @param {number} tolerance
 * @returns {{ centre: number, min: number, max: number, members: number[] }[]}
 */
export function cluster1d(values, tolerance) {
  const sorted = [...values].sort((a, b) => a - b);
  const groups = [];
  let current = [];

  for (const v of sorted) {
    if (current.length === 0 || v - current[current.length - 1] <= tolerance) {
      current.push(v);
    } else {
      groups.push(current);
      current = [v];
    }
  }
  if (current.length) groups.push(current);

  return groups.map(members => ({
    centre: members.reduce((a, b) => a + b, 0) / members.length,
    min: members[0],
    max: members[members.length - 1],
    members,
  }));
}

export const median = xs => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Group words into visual rows by vertical position.
 *
 * @param {{y0:number,y1:number}[]} words
 * @param {{ gapFactor?: number }} [opts]  gap as a multiple of median height
 */
export function groupRows(words, opts = {}) {
  const gapFactor = opts.gapFactor ?? 0.6;
  if (!words.length) return [];

  const heights = words.map(w => w.y1 - w.y0).filter(h => h > 0);
  const h = median(heights) || 10;
  const tolerance = h * gapFactor;

  const withCentre = words.map(w => ({ ...w, yc: (w.y0 + w.y1) / 2 }));
  withCentre.sort((a, b) => a.yc - b.yc);

  const rows = [];
  let current = [withCentre[0]];

  for (let i = 1; i < withCentre.length; i++) {
    const w = withCentre[i];
    const prev = current[current.length - 1];
    if (w.yc - prev.yc <= tolerance) current.push(w);
    else {
      rows.push(current);
      current = [w];
    }
  }
  rows.push(current);

  return rows.map(members => {
    members.sort((a, b) => a.x0 - b.x0);
    return {
      y0: Math.min(...members.map(m => m.y0)),
      y1: Math.max(...members.map(m => m.y1)),
      yc: members.reduce((a, m) => a + m.yc, 0) / members.length,
      words: members,
      text: members.map(m => m.text).join(' '),
    };
  });
}

const MONEYISH = /^\(?-?[\d,]*\d(?:\.\d{1,2})?\)?$/;

/**
 * The pieces hidden inside a token that swallowed two or more adjacent cells.
 *
 * Where two columns sit close and the rule between them is faint, Vision reads
 * "1,156,452,000.001,156,452,000.00" as a single word. Every figure on these
 * forms ends in exactly two decimals, so a ".dd" followed immediately by
 * another digit is the seam.
 *
 * This returns the text pieces only, with no geometry. Estimating where the
 * seam falls in pixels does not work -- the gap between the columns is inside
 * the token's span, so apportioning by character count puts the pieces in the
 * wrong columns. buildGrid instead lays the pieces into the N columns ending at
 * the one the token's (accurate) right edge lands in.
 *
 * @param {string} text
 * @returns {string[]|null} the pieces, or null if this is an ordinary token
 */
export function concatenatedMoneyParts(text) {
  if (!/^[\d,]+\.\d{2}(?:[\d,]+\.\d{2})+$/.test(text)) return null;
  const parts = text.match(/[\d,]+?\.\d{2}/g);
  if (!parts || parts.length < 2 || parts.join('') !== text) return null;
  return parts;
}

/**
 * Reassemble numbers that OCR split at their separators.
 *
 * Where the scan is faint, Vision loses the comma or the decimal point and
 * emits the digit groups as separate words: "30.171" "752" "10" instead of
 * "30,171,752.10". The give-away is geometric, and it is stark -- fragments of
 * one number sit about 1px apart, while the narrowest genuine gap between two
 * columns measured 6px on the same page. So a small gap is the trigger.
 *
 * The gap alone is not enough to be safe, though, so a merge is only kept when
 * it produces a well-formed money value AND at least one fragment was not one
 * already. Two complete adjacent figures are therefore never welded together.
 *
 * @param {object[]} words  one visual row, left to right
 * @param {{ maxGap?: number }} [opts]
 */
export function mergeNumericFragments(words, opts = {}) {
  const maxGap = opts.maxGap ?? 4;
  const isFrag = w => /^[\d.,]+$/.test(w.text);
  const out = [];
  let i = 0;

  while (i < words.length) {
    const w = words[i];
    if (!isFrag(w)) {
      out.push(w);
      i++;
      continue;
    }

    let j = i + 1;
    while (
      j < words.length &&
      isFrag(words[j]) &&
      words[j].x0 - words[j - 1].x1 <= maxGap
    )
      j++;

    if (j - i > 1) {
      const run = words.slice(i, j);
      const merged = reassembleMoney(run.map(r => r.text));
      const alreadyWhole = run.some(
        r => MONEYISH.test(r.text) && /\.\d{2}$/.test(r.text)
      );
      if (merged && !alreadyWhole) {
        out.push({
          ...w,
          text: merged,
          x1: run[run.length - 1].x1,
          y1: Math.max(...run.map(r => r.y1)),
          merged: run.map(r => r.text),
        });
        i = j;
        continue;
      }
    }

    out.push(w);
    i++;
  }

  return out;
}

/**
 * Rebuild "30,171,752.10" from ["30.171", "752", "10"].
 *
 * Every figure on these forms carries exactly two decimal places, so the last
 * two digits are the centavos and everything before them groups in threes.
 * Returns null when the pieces do not add up to a plausible figure -- a
 * fragment that is not purely digits, or an implausible length.
 */
function reassembleMoney(parts) {
  const digits = parts.join('').replace(/[.,]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length < 3 || digits.length > 15) return null;

  const decimals = digits.slice(-2);
  const whole = digits.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimals}`;
}

/**
 * Infer column boundaries from the right edges of numeric tokens.
 *
 * Only numeric tokens vote. Label text in column 1 wraps and ragged-rights all
 * over the place, and letting it vote drags the first boundary around; the
 * label column is instead defined as everything left of the first numeric
 * boundary.
 *
 * @param {{text:string,x0:number,x1:number,y0:number,y1:number}[]} words
 * @param {{ tolerance?: number, minMembers?: number }} [opts]
 * @returns {{ edges: number[], columns: {right:number,left:number,votes:number}[] }}
 */
export function inferColumnsFromRightEdges(words, opts = {}) {
  const numeric = words.filter(w => MONEYISH.test(w.text.replace(/\s/g, '')));
  if (!numeric.length) return { edges: [], columns: [] };

  const heights = numeric.map(w => w.y1 - w.y0).filter(h => h > 0);
  // A column's right edge is stable to about half a glyph height; that scales
  // with the render resolution, so derive it rather than hardcoding pixels.
  const tolerance = opts.tolerance ?? Math.max(3, median(heights) * 0.5);
  const minMembers = opts.minMembers ?? 2;

  const groups = cluster1d(
    numeric.map(w => w.x1),
    tolerance
  ).filter(g => g.members.length >= minMembers);

  const columns = groups.map(g => ({
    right: g.max,
    centre: g.centre,
    left: null,
    votes: g.members.length,
  }));

  // Left boundary of each column is the midpoint between its right edge and
  // the previous column's right edge.
  for (let i = 0; i < columns.length; i++) {
    const prevRight = i === 0 ? null : columns[i - 1].right;
    columns[i].left =
      prevRight === null ? null : (prevRight + columns[i].right) / 2;
  }

  return { edges: columns.map(c => c.right), columns };
}

/**
 * Boundaries that partition the page into one interval per column.
 *
 * A token belongs to the column whose interval contains its right edge. This
 * matters more than it looks: picking the *nearest* column instead lets two
 * tokens both claim one column while the column between them is left empty --
 * which is exactly how "1,156,452,000.00" and the identical figure beside it
 * ended up concatenated into a single cell, with the adjusted-appropriations
 * column reported blank. A partition cannot do that.
 */
export function columnBounds(columns) {
  const rights = columns.map(c => c.right);
  const gaps = rights.slice(1).map((r, i) => r - rights[i]);
  const halfFirst = (gaps.length ? median(gaps) : 0) / 2;

  const bounds = [rights[0] - halfFirst];
  for (let i = 1; i < rights.length; i++) {
    bounds.push((rights[i - 1] + rights[i]) / 2);
  }
  bounds.push(rights[rights.length - 1] + halfFirst);
  return bounds;
}

/**
 * Column index for a word's right edge, or -1 for the label column.
 * `bounds` has columns.length + 1 entries.
 */
export function assignColumn(word, bounds) {
  if (word.x1 <= bounds[0]) return -1;
  for (let i = 1; i < bounds.length; i++) {
    if (word.x1 <= bounds[i]) return i - 1;
  }
  return -1; // right of the last column: off the table
}

/**
 * Build a cell grid from OCR words plus resolved columns.
 *
 * `opts.bounds` overrides the partition derived from the columns' right edges.
 * FAR No. 5 needs that: most of its figure columns are blank in most years, so
 * there are no edges to cluster, and the partition has to come from the printed
 * header instead.
 *
 * @param {object[]} words
 * @param {{right:number}[]} columns
 * @param {{ gapFactor?: number, bounds?: number[] }} [opts]
 * @returns {{ label: string, cells: (string|null)[], collisions: number[], welded: number[], y0:number, y1:number, words: object[] }[]}
 */
export function buildGrid(words, columns, opts = {}) {
  if (!columns.length) return [];
  const bounds = opts.bounds ?? columnBounds(columns);
  const rows = groupRows(words, opts);

  return rows.map(row => {
    const cells = new Array(columns.length).fill(null);
    const labelParts = [];
    const collisions = [];
    const welded = [];

    for (const w of row.words) {
      const col = assignColumn(w, bounds);
      if (col === -1) {
        labelParts.push(w);
        continue;
      }
      // A welded token fills the run of columns ending at this one.
      const parts = concatenatedMoneyParts(w.text);
      if (parts) {
        const start = col - parts.length + 1;
        if (start >= 0 && parts.every((_, k) => cells[start + k] === null)) {
          parts.forEach((part, k) => {
            cells[start + k] = part;
          });
          welded.push(col);
          continue;
        }
      }

      if (cells[col] === null) {
        cells[col] = w.text;
      } else {
        // Two tokens in one cell after fragment merging is a real signal that
        // something is off -- a stray mark, or a column boundary in the wrong
        // place. Record it so validation can weigh the row accordingly rather
        // than silently gluing the two together.
        cells[col] = `${cells[col]} ${w.text}`;
        collisions.push(col);
      }
    }

    labelParts.sort((a, b) => a.x0 - b.x0);
    return {
      label: labelParts.map(w => w.text).join(' '),
      labelX0: labelParts.length
        ? Math.min(...labelParts.map(w => w.x0))
        : null,
      cells,
      collisions,
      welded,
      y0: row.y0,
      y1: row.y1,
      words: row.words,
    };
  });
}
