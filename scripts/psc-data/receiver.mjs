/**
 * Local ingest receiver for the PSC transparency-seal pipeline.
 *
 * Cloudflare 403s every shell HTTP client on psc.gov.ph, so bytes can only be
 * fetched from inside a real browser session. The obvious bridge -- an <a
 * download> click -- turned out to be unreliable: Chrome silently suppresses
 * repeat programmatic downloads from an origin until the user grants the
 * "multiple downloads" permission, and the failure is invisible to the page.
 *
 * So the page POSTs the bytes here instead. Chrome treats http://127.0.0.1 as a
 * potentially-trustworthy origin, so an https page may POST to it without
 * tripping mixed-content blocking; CORS is handled below.
 *
 * Usage:  node scripts/psc-data/receiver.mjs [--port 7788]
 *
 *   GET  /health                      -> { ok: true }
 *   POST /json?name=<file>            -> writes data/catalog/<file>.json
 *   POST /pdf?docId=&series=&fy=&sha256=&sourceUrl=
 *                                     -> writes data/raw/<series>/<fy>/<docId>.pdf
 *                                        and re-hashes it in node
 *   GET  /have                        -> { docIds: [...] } already on disk
 */
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const RAW = path.join(ROOT, 'data/raw');
const CATALOG = path.join(ROOT, 'data/catalog');

const portArg = process.argv.indexOf('--port');
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 7788;

// Chrome's Private Network Access rules: a request from a public origin
// (https://psc.gov.ph) to a local address is preflighted with
// Access-Control-Request-Private-Network and is dropped unless the response
// opts in with Access-Control-Allow-Private-Network. Without this the fetch
// hangs and then aborts, with nothing reaching the server.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true',
  'Access-Control-Max-Age': '86400',
};

const send = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, { ...CORS, 'Content-Type': 'application/json' });
  res.end(body);
};

const readBody = req =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const sha256 = buf => createHash('sha256').update(buf).digest('hex');

/** Filesystem-safe and predictable: the docId is the filename everywhere. */
const safe = s => String(s || '').replace(/[^a-zA-Z0-9._-]/g, '-');

let received = 0;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (process.env.PSC_RECEIVER_TRACE) {
    console.log(`  <- ${req.method} ${url.pathname}${url.search.slice(0, 60)}`);
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (url.pathname === '/health') {
    return send(res, 200, { ok: true, received, root: ROOT });
  }

  if (url.pathname === '/have') {
    const docIds = [];
    const walk = async dir => {
      if (!existsSync(dir)) return;
      for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) await walk(p);
        else if (e.name.endsWith('.pdf')) {
          const { size } = await stat(p);
          if (size > 0) docIds.push(e.name.replace(/\.pdf$/, ''));
        }
      }
    };
    await walk(RAW);
    return send(res, 200, { docIds });
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });

  const buf = await readBody(req);

  if (url.pathname === '/json') {
    const name = safe(url.searchParams.get('name') || 'payload');
    await mkdir(CATALOG, { recursive: true });
    const out = path.join(CATALOG, `${name}.json`);
    await writeFile(out, buf);
    received++;
    console.log(`json  ${name}.json  ${buf.length} bytes`);
    return send(res, 200, {
      ok: true,
      path: path.relative(ROOT, out),
      bytes: buf.length,
    });
  }

  if (url.pathname === '/pdf') {
    const docId = safe(url.searchParams.get('docId'));
    const series = safe(url.searchParams.get('series') || 'misc');
    const fy = safe(url.searchParams.get('fy') || 'unknown');
    const claimed = url.searchParams.get('sha256');
    if (!docId) return send(res, 400, { error: 'docId required' });

    // The hash is computed twice on purpose: once in the page over the bytes
    // that came off the wire, once here over the bytes that hit the disk. A
    // mismatch means the bridge corrupted something and the run must stop.
    const actual = sha256(buf);
    if (claimed && claimed !== actual) {
      console.error(`HASH MISMATCH ${docId}: page=${claimed} disk=${actual}`);
      return send(res, 409, {
        error: 'sha256 mismatch',
        claimed,
        actual,
        bytes: buf.length,
      });
    }

    const dir = path.join(RAW, series, fy);
    await mkdir(dir, { recursive: true });
    const out = path.join(dir, `${docId}.pdf`);
    await writeFile(out, buf);
    received++;
    console.log(
      `pdf   ${docId}  ${(buf.length / 1048576).toFixed(2)} MB  ${actual.slice(0, 12)}  (${received})`
    );
    return send(res, 200, {
      ok: true,
      docId,
      sha256: actual,
      bytes: buf.length,
      path: path.relative(ROOT, out),
    });
  }

  return send(res, 404, { error: 'unknown path' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`psc-data receiver listening on http://127.0.0.1:${PORT}`);
  console.log(`writing under ${ROOT}`);
});
