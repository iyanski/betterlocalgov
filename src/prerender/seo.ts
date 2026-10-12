import { absoluteUrl, siteConfig } from '../config/site';
import type { PublicRoute } from './publicRoutes';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function pageTitle(route: Pick<PublicRoute, 'title'>): string {
  return route.title
    ? `${route.title} | ${siteConfig.name}`
    : `${siteConfig.name} - Community Civic Information Portal`;
}

export function canonicalUrl(path: string): string {
  return absoluteUrl(path);
}

/**
 * Head tags injected into each pre-rendered page. `data-rh="true"` lets
 * react-helmet-async replace them once the application takes over.
 */
export function buildHeadTags(
  route: Pick<PublicRoute, 'path' | 'title' | 'description'>
): string {
  const title = pageTitle(route);
  const url = canonicalUrl(route.path);
  const image = absoluteUrl(siteConfig.defaultImagePath);
  const description = escapeHtml(route.description || siteConfig.description);
  const tag = (markup: string) =>
    markup.replace(/ \/?>$/, ' data-rh="true" />');

  return [
    `<title data-rh="true">${escapeHtml(title)}</title>`,
    tag(`<meta name="description" content="${description}" />`),
    tag(`<link rel="canonical" href="${escapeHtml(url)}" />`),
    tag(`<meta property="og:type" content="website" />`),
    tag(
      `<meta property="og:site_name" content="${escapeHtml(siteConfig.name)}" />`
    ),
    tag(`<meta property="og:title" content="${escapeHtml(title)}" />`),
    tag(`<meta property="og:description" content="${description}" />`),
    tag(`<meta property="og:url" content="${escapeHtml(url)}" />`),
    tag(`<meta property="og:image" content="${escapeHtml(image)}" />`),
    tag(`<meta name="twitter:card" content="summary_large_image" />`),
    tag(`<meta name="twitter:title" content="${escapeHtml(title)}" />`),
    tag(`<meta name="twitter:description" content="${description}" />`),
    tag(`<meta name="twitter:image" content="${escapeHtml(image)}" />`),
  ].join('\n    ');
}

export function buildSitemap(
  routes: Pick<PublicRoute, 'path' | 'lastModified'>[]
): string {
  const entries = routes.map(route => {
    const lastmod = route.lastModified
      ? `\n    <lastmod>${route.lastModified}</lastmod>`
      : '';
    return `  <url>\n    <loc>${escapeHtml(canonicalUrl(route.path))}</loc>${lastmod}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

export function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
}

/** Injects head tags and body markup into the built `index.html` shell. */
export function applyTemplate(
  template: string,
  route: Pick<PublicRoute, 'path' | 'title' | 'description'>,
  bodyHtml: string
): string {
  const withoutDefaults = template
    .replace(/\s*<title[^>]*>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta[^>]*name="description"[^>]*\/?>/i, '');
  const withHead = withoutDefaults.replace(
    '</head>',
    `    ${buildHeadTags(route)}\n</head>`
  );
  if (!withHead.includes('<div id="root"></div>')) {
    throw new Error(
      'Template is missing the empty #root element (already pre-rendered? run `vite build` first)'
    );
  }
  // The same index.html is served for routes that were not pre-rendered, so
  // drop the static body there rather than flash another page's content.
  const clearIfOtherRoute = `<script>(function(){var p=location.pathname.replace(/\\/+$/,'')||'/';if(p!==${JSON.stringify(route.path)}){var r=document.getElementById('root');if(r)r.textContent='';}})();</script>`;
  return withHead.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>\n    ${clearIfOtherRoute}`
  );
}
