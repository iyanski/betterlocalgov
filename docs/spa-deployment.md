# SPA deployment fallback

Better Gattaran is a client-rendered Vite application. A production server must
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
