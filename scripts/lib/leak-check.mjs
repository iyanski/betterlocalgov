/**
 * Pure helpers for scripts/check-dist-leaks.mjs: fingerprint the text of
 * non-public content and look for it in build output.
 */

/** Minimum normalized length for a fingerprint, to avoid trivial matches. */
export const MIN_FINGERPRINT_LENGTH = 24;

/** \u{...}, \uXXXX and \xXX escapes inside JS string literals. */
const ESCAPE_PATTERN =
  /\\u\{[0-9a-fA-F]+\}|\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}/g;

/**
 * Reduces text to lowercase ASCII letters and digits, with every non-ASCII
 * character as `~`. In bundles, \u and \x escapes are decoded first, so a
 * fingerprint matches a minified string literal however it is escaped.
 */
export function normalizeForMatch(text, { bundle = false } = {}) {
  let value = String(text);
  if (bundle) {
    value = value.replace(ESCAPE_PATTERN, escape =>
      String.fromCodePoint(
        Number.parseInt(escape.replace(/^\\[ux]\{?|\}$/g, ''), 16)
      )
    );
  }
  return value
    .replace(/[^\x00-\x7f]/g, '~')
    .replace(/[^A-Za-z0-9~]/g, '')
    .toLowerCase();
}

function collectStrings(value, out) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) {
    value.forEach(item => collectStrings(item, out));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectStrings(item, out));
  }
  return out;
}

/** Candidate lines or values from one file's text, before filtering. */
export function fingerprintCandidates(text, kind) {
  if (kind === 'json') {
    try {
      return collectStrings(JSON.parse(text), []);
    } catch {
      return [];
    }
  }
  return String(text).split(/\r?\n/);
}

/**
 * Fingerprints for hidden texts: normalized strings long enough to be
 * distinctive and absent from every public text (so shared boilerplate such
 * as a common disclaimer line never causes a false alarm).
 *
 * @param {{ label: string, text: string, kind: 'json' | 'text' }[]} hidden
 * @param {string[]} publicTexts
 */
export function buildFingerprints(hidden, publicTexts) {
  const publicCorpus = publicTexts
    .map(text => normalizeForMatch(text))
    .join('\n');
  const fingerprints = [];
  const seen = new Set();
  for (const item of hidden) {
    for (const candidate of fingerprintCandidates(item.text, item.kind)) {
      const normalized = normalizeForMatch(candidate);
      if (normalized.length < MIN_FINGERPRINT_LENGTH) continue;
      if (publicCorpus.includes(normalized)) continue;
      const key = `${item.label}\u0000${normalized}`;
      if (seen.has(key)) continue;
      seen.add(key);
      fingerprints.push({
        label: item.label,
        normalized,
        excerpt: candidate.trim().slice(0, 80),
      });
    }
  }
  return fingerprints;
}

/**
 * @param {{ label: string, normalized: string, excerpt: string }[]} fingerprints
 * @param {{ file: string, text: string }[]} outputs
 * @returns {{ label: string, excerpt: string, file: string }[]}
 */
export function findLeaks(fingerprints, outputs) {
  const leaks = [];
  for (const output of outputs) {
    const haystack = normalizeForMatch(output.text, { bundle: true });
    for (const fingerprint of fingerprints) {
      if (haystack.includes(fingerprint.normalized)) {
        leaks.push({
          label: fingerprint.label,
          excerpt: fingerprint.excerpt,
          file: output.file,
        });
      }
    }
  }
  return leaks;
}
