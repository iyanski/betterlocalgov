# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-09-26

### Added

- Financial Stewardship section under Transparency: refreshed FY2025 figures
  for Annual Regular Income (ARI) and Dependencies, Statements of Receipts
  and Expenditure, Disaster Risk Reduction and Management (DRRM) Fund, and a
  new Special Education Fund (SEF) page, each with a multi-year trend chart.
- Dependency-free, build-time client-side site search (`/search`) covering
  services, government, transparency, statistics, and updates content, with
  a search icon in the navbar.
- Homepage hero "What brings you here?" quick-start card linking to Civil
  Registry Services, Leadership, Demographics, and DPWH Projects in Aparri,
  with a fallback link to site search.
- Homepage "Emergency Hotlines" section below the hero banner, and a shared
  `src/data/hotlines.ts` hotline directory reused across the site.
- Sitemap link added to the footer's Quick Links.
- `.claude/agents/` planner/implementer/QA/commit-officer subagent workflow
  and a `docs/plan/` convention for tracking feature plans (git-ignored).

### Changed

- Navbar: replaced the red top-bar hotlines block with a slim utility strip
  ("Community Project" label, Join Us, Hotlines), and scaled the sticky
  logo down on small screens so it no longer dominates the mobile viewport.
- Footer: "built by egiebk" relabeled to "Contribute at GitHub", linking to
  the repository.
- Breadcrumbs now wrap onto a second line instead of overflowing
  horizontally on narrow screens.
- Transparency navigation labels clarified ("Receipts and Expenditures",
  "DRRM Funds", "Special Education Funds") and reordered.

### Removed

- Empty service categories with no content
  (`infrastructure-public-works`, `environment`, `disaster-preparedness`,
  `housing-land-use`).

## [1.3.7] - 2026-08-27

### Added

- DPWH Projects in Aparri transparency page with normalized project data,
  summary metrics, filters, sorting, and compact record rows.
- Navigation and transparency index entry for `/transparency/dpwh-projects`.
- Status filtering and progress sorting for procurement-style transparency
  records.

### Changed

- Procurement record cards redesigned into a more compact ledger-style layout.
- Frontpage weather section simplified with a retained blue current-weather
  card, compact metric cards, and clearer resident guidance.
- Weather guidance now uses PAGASA-style 24-hour rainfall thresholds for daily
  rain guidance.
- Emergency hotline top bar updated to use red Tailwind color utilities.
- Compact peso totals now display with two decimal places.

## [0.2.0] - 2026-03-07

### Added

- `/government` and `/government/:category` routes with a new `Government` page
- Government section content system under `content/government/` (departments: executive, legislative)
- `src/pages/Government.tsx` — category listing page for government departments
- `src/data/government.yaml` — top-level government category definitions
- Expanded `Document` page to support government content alongside services
- Navigation updated: main nav Government item now links to `/government/departments`
- OG image template redesigned for improved open graph previews
- Companion JSON files for markdown pages — optional `{slug}.json` files supply `{PLACEHOLDER}` token values (official names, dates, etc.) interpolated at load time, with `VITE_<KEY>` env vars as fallback

### Changed

- `yamlLoader.ts` refactored to handle both service and government category indexes
- `markdownLoader.ts` refactored to resolve markdown files across content types; now also loads companion JSON and runs `interpolate()` for token substitution
- `Navbar` updated to support government section routing
- `Breadcrumbs` updated to reflect government section paths
- `Section` component adjusted for layout consistency
- `GovernmentActivitySection` on Home page now points to live government routes
- `Services` page layout and routing logic improved
- Locale strings updated in `public/locales/en/common.json` and `src/i18n/locales/en.json`

### Documentation

- `README.md` — project structure and content setup steps updated for government section
- `CLAUDE.md` — routing, content system, and companion JSON file behavior documented
- `CONTENT-MANAGEMENT.md` — added government department pages section, JSON data files explained, dynamic placeholder workflow included
- `CONTENT-GUIDE.md` — added department/office page template, content type, and "Dynamic Content with Placeholders" section

## [0.1.0] - 2026-03-06

### Added

- `@bettergov/kapwa` component library integrated as the primary UI primitive layer
- New font and theme setup via `src/fonts.css`
- `react-helmet-async` for SEO and document head management

### Changed

- Migrated styling pipeline to **Tailwind CSS v4** (Vite plugin, PostCSS config updated)
- Replaced local `Card` component (`src/components/ui/Card.tsx`) with Kapwa card primitives
- Replaced legacy `ListItem` component with Kapwa cards and banners across Services, Home, and Document pages
- Updated `src/index.css` to align with Tailwind v4 conventions
- Upgraded `App.tsx` and `main.tsx` for the new app shell and SEO setup

### Removed

- `src/components/ui/Card.tsx` — superseded by Kapwa primitives
- `src/components/ui/ListItem.tsx` — superseded by Kapwa cards and banners

[0.2.0]: https://github.com/iyanski/betterlocalgov/releases/tag/v0.2.0
[0.1.0]: https://github.com/iyanski/betterlocalgov/releases/tag/v0.1.0
