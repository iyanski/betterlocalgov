# SPA deployment fallback

Better Gattaran is a client-rendered Vite application. `npm run build` also
pre-renders every publicly visible route (see below) so search engines and link
previews receive real HTML; the application still takes over in the browser. A production server must
serve `index.html` when an application route does not match a real file or
directory. Without that fallback, direct requests such as `/services` or
`/government/departments` return a server-level 404 before React Router runs.

Static assets must keep their normal behavior. Do not rewrite an existing file
such as `/assets/index-*.js`, `/favicon.svg`, or `/locales/en/common.json` to
`index.html`.

## Included configurations

- `vercel.json` checks the generated filesystem before applying the catch-all
  application rewrite.
- `public/.htaccess` is copied into `dist/` for Apache hosts with `mod_rewrite`.
  It preserves real files and directories, then falls back to `index.html`.

## Nginx or another conventional web server

Use the equivalent of this rule in the server configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

After deployment, verify that `/`, `/services`, `/government/departments`, and
one service-detail URL all return the application. Also verify that real assets
retain their expected content type and a missing file-like URL returns 404.

Vite's local `preview` command validates direct application routes and real
assets, but its built-in SPA fallback also returns `index.html` for unknown
file-like URLs. Use the deployed server—not `vite preview`—for the final
missing-asset 404 check.

## Build-time pre-rendering

`npm run build` runs `vite build` and then `scripts/prerender.mjs`, which writes
into `dist/`:

- `index.html` (home) and `<route>/index.html` for each public route: static
  semantic HTML in `#root`, plus a per-page `<title>`, meta description,
  canonical URL, `og:*` and `twitter:*` tags. The default share image is
  `/bettergattaran.png`.
- `sitemap.xml` and `robots.txt`.

The route list comes from `src/prerender/publicRoutes.ts`, which applies the same
visibility policy (`isRecordPublic`) as the document viewer. Draft, archived,
awaiting-verification and blocked records therefore never reach the HTML or
the sitemap. The site origin comes from `VITE_WEBSITE_URL` and defaults to
`https://bettergattaran.org`.

Why a post-build step rather than `vite-react-ssg`: the application uses a
declarative `BrowserRouter` and loads content in effects. `vite-react-ssg`
would require migrating to React Router's data router and moving all content
loading into route loaders. The post-build step changes no application routing
and reuses the existing data modules.

### Hosting behavior

- `vercel.json` and `public/.htaccess` are unchanged. Real files and
  directories are served first, so `/hotlines` resolves to
  `hotlines/index.html`; unknown routes still fall back to `index.html`.
- Apache redirects a directory request such as `/hotlines` to `/hotlines/`
  (`DirectorySlash`). Canonical URLs have no trailing slash; this is harmless
  but visible in the address bar.
- `index.html` is also the SPA fallback, so each pre-rendered page includes a
  tiny inline script that removes its static body when the browser path is a
  different route.
- Vite's `preview` serves `index.html` for every route, so it cannot show the
  pre-rendered pages. Inspect `dist/` or use a plain static file server.
