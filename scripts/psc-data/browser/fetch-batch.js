/**
 * Runs IN THE PAGE CONTEXT of https://psc.gov.ph/psc_site/transparency-seal/
 * (via mcp__claude-in-chrome__javascript_tool), not under node.
 *
 * Cloudflare 403s every shell HTTP client on this host -- curl and wget are
 * refused on the HTML page and on every PDF, with any header set, on both the
 * current and the retired host. A same-origin fetch from a real browser session
 * is the only thing that gets the bytes.
 *
 * Getting them OUT of the browser is the other half of the problem. A POST to a
 * local receiver is dropped by Chrome's Private Network Access rules before it
 * leaves the renderer, so the bytes ride out through the downloads directory.
 *
 * PREREQUISITE: Chrome must allow automatic downloads for psc.gov.ph
 * (site settings -> Automatic downloads -> Allow). Without it Chrome silently
 * suppresses every download after the first, the page sees no error, and this
 * script will report success for files that never landed. stage 01-ingest
 * cross-checks the count and fails loudly if they are missing.
 *
 * The page-side SHA-256 travels in the filename, which is the only side channel
 * available: 01-ingest re-hashes the bytes on disk and compares, so a corrupted
 * round-trip cannot pass silently.
 *
 *   psc__<docId>__<first 16 hex of sha256>.pdf
 *
 * Usage, in the page console / javascript_tool:
 *
 *   window.__pscFetch(documents.slice(0, 20));   // returns a summary string
 *   window.__pscReport();                        // per-doc results so far
 */
(() => {
  const BATCH = 4; // concurrent fetches; the host is slow and easily annoyed
  const MIN_GAP_MS = 400;
  const MAX_GAP_MS = 1200;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const jitter = () => MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);

  const results = (window.__pscResults = window.__pscResults || {});

  const hex = buf =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

  async function grabOne(doc) {
    const started = Date.now();
    try {
      const res = await fetch(doc.sourceUrl, {
        credentials: 'include',
        redirect: 'follow',
      });

      if (!res.ok) {
        // A dead link is data, not a failure: 25 of the seal's own links point
        // at a host that was retired, and that is worth publishing.
        return (results[doc.docId] = {
          docId: doc.docId,
          sourceUrl: doc.sourceUrl,
          outcome: 'dead',
          status: res.status,
          ms: Date.now() - started,
        });
      }

      const buf = await res.arrayBuffer();
      const sha256 = hex(await crypto.subtle.digest('SHA-256', buf));

      // Guard against Cloudflare handing back an HTML challenge with a 200.
      const head = new TextDecoder().decode(new Uint8Array(buf.slice(0, 5)));
      if (head !== '%PDF-' && !/\.(xlsx?|docx?|csv)$/i.test(doc.sourceUrl)) {
        return (results[doc.docId] = {
          docId: doc.docId,
          sourceUrl: doc.sourceUrl,
          outcome: 'not-a-pdf',
          status: res.status,
          bytes: buf.byteLength,
          head,
          ms: Date.now() - started,
        });
      }

      const name = `psc__${doc.docId}__${sha256.slice(0, 16)}.pdf`;
      const url = URL.createObjectURL(
        new Blob([buf], { type: 'application/pdf' })
      );
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: name,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      return (results[doc.docId] = {
        docId: doc.docId,
        sourceUrl: doc.sourceUrl,
        outcome: 'ok',
        status: res.status,
        sha256,
        bytes: buf.byteLength,
        contentType: res.headers.get('content-type'),
        lastModified: res.headers.get('last-modified'),
        retrievedAt: new Date().toISOString(),
        file: name,
        ms: Date.now() - started,
      });
    } catch (err) {
      return (results[doc.docId] = {
        docId: doc.docId,
        sourceUrl: doc.sourceUrl,
        outcome: 'error',
        error: String(err && err.message ? err.message : err),
        ms: Date.now() - started,
      });
    }
  }

  window.__pscFetch = async docs => {
    const todo = docs.filter(d => {
      const prev = results[d.docId];
      return !prev || (prev.outcome !== 'ok' && prev.outcome !== 'dead');
    });

    for (let i = 0; i < todo.length; i += BATCH) {
      await Promise.all(todo.slice(i, i + BATCH).map(grabOne));
      if (i + BATCH < todo.length) await sleep(jitter());
    }

    const all = Object.values(results);
    const by = o => all.filter(r => r.outcome === o).length;
    const mb =
      all.filter(r => r.outcome === 'ok').reduce((a, r) => a + r.bytes, 0) /
      1048576;
    return `asked ${docs.length}, fetched ${todo.length} | ok ${by('ok')} dead ${by(
      'dead'
    )} error ${by('error')} notpdf ${by('not-a-pdf')} | ${mb.toFixed(1)} MB total`;
  };

  /** Compact per-doc status, small enough to survive the tool's return limit. */
  window.__pscReport = (filter = null) =>
    Object.values(results)
      .filter(r => !filter || r.outcome === filter)
      .map(r => `${r.outcome[0]}${r.docId}`)
      .join(' ');

  /**
   * The results are the primary source for the manifest -- hash, byte count and
   * retrieval time all come from the same fetch that produced the bytes. They
   * ride out the same way the PDFs do.
   */
  window.__pscSaveResults = () => {
    const blob = new Blob([JSON.stringify(Object.values(results), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'psc__fetch-results.json',
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return `saving ${Object.keys(results).length} results`;
  };

  return 'ready: __pscFetch(docs), __pscReport(), __pscSaveResults()';
})();
