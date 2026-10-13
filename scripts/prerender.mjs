/**
 * Post-build step: writes real HTML for every publicly visible route plus
 * sitemap.xml and robots.txt into dist/. Runs after `vite build`.
 *
 * The route list comes from src/prerender (the same visibility policy as the
 * application), loaded through Vite's SSR transform so TypeScript, ?raw and
 * import.meta.glob behave exactly as they do in the build.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';

const root = process.cwd();
const dist = path.join(root, 'dist');
const templatePath = path.join(dist, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
const server = await createServer({
  root,
  appType: 'custom',
  mode: 'production',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
});

try {
  const { buildPrerender } = await server.ssrLoadModule(
    '/src/prerender/index.ts'
  );
  const { routes, pages, sitemap, robots, whatsNew } =
    await buildPrerender(template);

  for (const page of pages) {
    for (const marker of ['<h1', 'rel="canonical"', 'property="og:image"']) {
      if (!page.html.includes(marker)) {
        throw new Error(`${page.file}: pre-rendered HTML lacks ${marker}`);
      }
    }
    const target = path.join(dist, page.file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, page.html);
  }
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(dist, 'robots.txt'), robots);
  fs.writeFileSync(
    path.join(dist, 'whats-new.json'),
    `${JSON.stringify(whatsNew)}\n`
  );

  console.log(`Pre-rendered ${pages.length} public routes:`);
  for (const route of routes) console.log(`  ${route.path}`);
} finally {
  await server.close();
}
