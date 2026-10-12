# Better Gattaran

Better Gattaran is an independent, volunteer-led, open-source civic information portal for Gattaran, Cagayan. It is not the official website of the Municipality of Gattaran and does not represent municipal policy.

Municipality-specific information is published only when its lifecycle state and public sources are recorded. The portal deliberately leaves sections empty when reliable information is unavailable.

## Development

Requirements: Node.js `^20.19.0` or `>=22.12.0` and npm.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run content:audit
npm test
npm run lint
npm run build
```

## Architecture

This repository is a static React 19, TypeScript, Vite, and Tailwind application. Content lives in `content/` as Markdown, YAML indexes, and companion JSON metadata. There is no database, backend, login, or browser-based administration system. Maintainers govern content through reviewed repository changes; Git history and `governance/` provide the audit trail.

Draft and archived records are excluded from listings, direct document routes, and search indexing. Published records must have an eligible verification state and valid source metadata.

The homepage also provides repository-verified emergency contacts and live Gattaran weather. Weather readings are dynamic external observations: the UI displays the provider and observation time returned by the CIS public weather API rather than applying repository verification badges to readings.

## Content governance

Publication and verification are separate:

- `draft`: work in progress; never public.
- `published`: eligible for public display when its verification state permits.
- `archived`: retained in the repository but not publicly displayed.
- `awaiting_verification`: not confirmed and not publishable.
- `sourced`: has a public source but has not been independently confirmed.
- `verified`: checked by a maintainer against the displayed source.
- `outdated`: retained as explicitly non-current context.

See [Content verification](docs/content-verification.md), [Content inventory](docs/content-inventory.md), and [Source inventory](docs/sources.md).

## Contributor rules

Never add factual municipal information without a reliable source. Do not infer current officials, contacts, schedules, fees, requirements, procedures, programs, or emergency details from search snippets, directories, another locality, or undated social posts.

For every public fact, record the source organization, URL, source type, source/effective date when available, last-updated date, and last-verified date. Submit content as a draft until review is complete. Do not place secrets or private reporter information in content or governance files.

## Configuration

Copy `env.example` to `.env.local`. Phase 3 settings control the stale-review interval, whether sourced content may appear, whether correction reports are enabled, and the correction issue destination.

## Upstream

The project is based on [BetterLocalGov](https://github.com/bettergovph/betterlocalgov). General starter-kit documentation is retained in `STARTER-KIT-README.md`; it does not override Better Gattaran's independence or content-verification policy.
