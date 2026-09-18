/**
 * Minimal binary PGM (P5) reader, and rule-line detection built on it.
 *
 * The FAR forms are printed with a full grid, and those rules are worth far
 * more than any clustering heuristic: they are the column boundaries, drawn by
 * the agency, rather than something inferred from where the ink happened to
 * land. Clustering is the fallback for when the scan has lost them.
 *
 * PGM is a text header followed by raw bytes, so parsing it takes about thirty
 * lines and saves pulling in an image library. ImageMagick does the
 * morphology; this just reads the result.
 */

/**
 * @param {Buffer} buf  P5 PGM as produced by `magick ... pgm:-`
 * @returns {{ width: number, height: number, max: number, data: Buffer }}
 */
export function readPGM(buf) {
  let pos = 0;
  const token = () => {
    // Whitespace-separated header fields, with '#' comments to the line end.
    while (pos < buf.length) {
      const c = buf[pos];
      if (c === 0x23) {
        while (pos < buf.length && buf[pos] !== 0x0a) pos++;
      } else if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) {
        pos++;
      } else break;
    }
    const start = pos;
    while (pos < buf.length) {
      const c = buf[pos];
      if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d) break;
      pos++;
    }
    return buf.toString('latin1', start, pos);
  };

  const magic = token();
  if (magic !== 'P5')
    throw new Error(`expected a binary PGM (P5), got ${magic}`);
  const width = Number(token());
  const height = Number(token());
  const max = Number(token());
  pos++; // exactly one whitespace byte follows the maxval

  return { width, height, max, data: buf.subarray(pos, pos + width * height) };
}

/**
 * Column positions of vertical rules.
 *
 * The morphology pass has already reduced the page to just the long vertical
 * strokes, so a column is a rule if enough of its pixels are set. Adjacent
 * columns are merged, because a scanned 1px rule lands on two or three.
 *
 * @param {{width:number,height:number,data:Buffer}} img
 * @param {{ minCoverage?: number, mergeWithin?: number }} [opts]
 * @returns {{ positions: number[], coverage: number[] }}
 */
export function verticalRules(img, opts = {}) {
  const { width, height, data } = img;
  const minCoverage = opts.minCoverage ?? 0.25;
  const mergeWithin = opts.mergeWithin ?? 6;

  const counts = new Int32Array(width);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) if (data[row + x] > 127) counts[x]++;
  }

  const hits = [];
  for (let x = 0; x < width; x++) {
    if (counts[x] / height >= minCoverage) hits.push(x);
  }

  const positions = [];
  const coverage = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    // Take the strongest column in the run rather than the mean: the darkest
    // column is the rule, the neighbours are scanner bleed.
    let best = run[0];
    for (const x of run) if (counts[x] > counts[best]) best = x;
    positions.push(best);
    coverage.push(counts[best] / height);
    run = [];
  };
  for (const x of hits) {
    if (run.length && x - run[run.length - 1] > mergeWithin) flush();
    run.push(x);
  }
  flush();

  return { positions, coverage };
}

/** Row positions of horizontal rules. Same idea, transposed. */
export function horizontalRules(img, opts = {}) {
  const { width, height, data } = img;
  const minCoverage = opts.minCoverage ?? 0.25;
  const mergeWithin = opts.mergeWithin ?? 6;

  const counts = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    let n = 0;
    for (let x = 0; x < width; x++) if (data[row + x] > 127) n++;
    counts[y] = n;
  }

  const hits = [];
  for (let y = 0; y < height; y++) {
    if (counts[y] / width >= minCoverage) hits.push(y);
  }

  const positions = [];
  const coverage = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    let best = run[0];
    for (const y of run) if (counts[y] > counts[best]) best = y;
    positions.push(best);
    coverage.push(counts[best] / width);
    run = [];
  };
  for (const y of hits) {
    if (run.length && y - run[run.length - 1] > mergeWithin) flush();
    run.push(y);
  }
  flush();

  return { positions, coverage };
}
