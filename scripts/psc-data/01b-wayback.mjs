/**
 * Stage 1b - try to recover documents the PSC's own transparency index points
 * at but no longer serves.
 *
 * Twenty of the seal's links are on www.web.psc.gov.ph, a host the agency
 * retired; eight more are 404s on the current host. Those documents are legally
 * required disclosures, so a copy in the Internet Archive is the difference
 * between a gap in the record and a recovered year.
 *
 * archive.org is not Cloudflare-fronted, so unlike psc.gov.ph this stage can
 * run over plain HTTP from node -- no browser needed.
 *
 * Consumes  data/manifest/manifest.json
 * Emits     data/raw/<series>/<fy>/<docId>.pdf         GITIGNORED
 *           data/catalog/wayback.json                  COMMITTED
 *
 * Anything recovered is marked sourceOfRecord: 'wayback' with the snapshot
 * timestamp, because a 2016 capture of a document is not the same claim as the
 * agency serving it today, and a reader deserves to know which they are looking
 * at.
 *
 * Usage:  node scripts/psc-data/01b-wayback.mjs [--only <docId>] [--limit n]
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const RAW = path.join(ROOT, 'data/raw');

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const ONLY = arg('--only', null);
const LIMIT = Number(arg('--limit', '0')) || Infinity;

const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * The availability API is friendlier than the CDX one but rate-limits hard, so
 * retry on 429 with a widening gap rather than hammering it.
 */
async function findSnapshot(url, attempt = 0) {
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(api, {
      headers: {
        'User-Agent': 'betterPSC transparency-seal mirror (contact via repo)',
      },
    });
    if (res.status === 429 && attempt < 4) {
      await sleep(4000 * (attempt + 1));
      return findSnapshot(url, attempt + 1);
    }
    if (!res.ok) return { error: `availability ${res.status}` };
    const json = await res.json();
    const snap = json?.archived_snapshots?.closest;
    if (!snap || !snap.available) return { error: 'no snapshot' };
    return {
      url: snap.url.replace(/^http:/, 'https:'),
      timestamp: snap.timestamp,
    };
  } catch (err) {
    return { error: String(err.message || err).slice(0, 120) };
  }
}

async function main() {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, 'data/manifest/manifest.json'), 'utf8')
  );

  let targets = manifest.documents.filter(
    d => d.inScope && d.status !== 'live' && (!ONLY || d.docId === ONLY)
  );
  targets = targets.slice(0, LIMIT);
  console.log(
    `${targets.length} in-scope documents to look for in the archive\n`
  );

  const out = [];
  for (const doc of targets) {
    process.stdout.write(`${doc.docId.padEnd(34)}`);
    const snap = await findSnapshot(doc.sourceUrl);

    if (snap.error) {
      console.log(`no  (${snap.error})`);
      out.push({
        docId: doc.docId,
        sourceUrl: doc.sourceUrl,
        recovered: false,
        reason: snap.error,
      });
      await sleep(1200);
      continue;
    }

    try {
      // "id_" asks the Wayback Machine for the original bytes rather than its
      // rewritten, banner-injected version.
      const raw = snap.url.replace(/\/(\d{14})\//, '/$1id_/');
      const res = await fetch(raw);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
        throw new Error('snapshot is not a PDF');
      }

      const dir = path.join(
        RAW,
        doc.series,
        String(doc.fiscalYear ?? 'unknown')
      );
      await mkdir(dir, { recursive: true });
      const dest = path.join(dir, `${doc.docId}.pdf`);
      await writeFile(dest, buf);

      const hash = sha256(buf);
      console.log(
        `YES ${snap.timestamp.slice(0, 8)}  ${(buf.length / 1048576).toFixed(1)} MB  ${hash.slice(0, 12)}`
      );
      out.push({
        docId: doc.docId,
        sourceUrl: doc.sourceUrl,
        recovered: true,
        sourceOfRecord: 'wayback',
        snapshotUrl: snap.url,
        snapshotTimestamp: snap.timestamp,
        sha256: hash,
        bytes: buf.length,
        retrievedAt: new Date().toISOString(),
        localPath: path.relative(ROOT, dest),
      });
    } catch (err) {
      console.log(`no  (${String(err.message || err).slice(0, 60)})`);
      out.push({
        docId: doc.docId,
        sourceUrl: doc.sourceUrl,
        recovered: false,
        reason: String(err.message || err).slice(0, 120),
      });
    }
    await sleep(1500);
  }

  await writeFile(
    path.join(ROOT, 'data/catalog/wayback.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), attempts: out },
      null,
      2
    ) + '\n'
  );

  const got = out.filter(o => o.recovered).length;
  console.log(
    `\nrecovered ${got} of ${out.length}. Re-run 01-ingest to fold them into the manifest.`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
