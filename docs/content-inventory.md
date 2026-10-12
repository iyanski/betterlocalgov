# Phase 3 content inventory

Inventory date: 2026-09-23

## A. Supported by authoritative sources

- Municipality overview: Philippine Statistics Authority PSGC records.
- Barangay list and population context: Philippine Statistics Authority PSGC records.
- Municipal mayor: current Provincial Government of Cagayan directory.
- Authoritative record repositories: Commission on Audit and PSA entry points. The portal does not summarize unverified financial figures.
- National Emergency Hotline, Gattaran Emergency Hospital, and Cagayan PDRRMO contact records: official Philippine and Provincial Government sources.

These seven records are `published` + `verified`, have public provenance companions, internal governance-register entries, and visible verification dates.

## B. Has a source but requires review

No public record is currently classified `sourced`. The model supports it, and deployment can disable all sourced content with configuration.

## C. No reliable source currently stored

- Municipal office structure, office heads, locations, contacts, and hours.
- Vice mayor and Sangguniang Bayan membership.
- Other emergency and public-safety contacts, including Gattaran MDRRMO, police, and fire contacts.
- Local ordinances, resolutions, consultations, notices, projects, budgets, procurement records, and service procedures.
- Gattaran-specific requirements, fees, processing times, schedules, and eligibility rules.

These areas remain empty or draft and render intentional awaiting-verification states.

## D. Potentially outdated

- A Provincial Government of Cagayan article from 13 February 2024 names a prior mayor. It is documented in `docs/sources.md` but is not used for the current official.
- Published records will be flagged by `npm run content:audit` after the configured reverification interval; none is automatically deleted.

## E. Placeholder or inherited demo content

Phase 4 removed this content (see Git history before the Phase 4 cleanup commit for the original files):

- Fifteen Markdown service files containing Lapu-Lapu/Cebu starter content, and the empty public-market-stall file.
- All hypothetical service entries in `content/services/*/index.yaml`. Category files are kept with `pages: []`, so each category renders its intentional "pending verification" empty state.
- Unused starter-kit leftovers `src/components/I18nTest.tsx` and `src/assets/react.svg` (confirmed unreferenced by grep).

`src/lib/legacyContent.ts` is retained as a defensive guard against reintroducing inherited Lapu-Lapu content.

## Architecture findings

- Content is file-backed; there is no database or API.
- YAML indexes drive category listings; Markdown provides prose; companion JSON provides interpolation and public provenance.
- `src/lib/contentGovernance.ts` owns controlled statuses, source types, visibility logic, URL safety, and staleness logic.
- `governance/content-register.json` stores reviewer ownership and internal review notes outside the frontend bundle.
- `governance/revisions.json` and Git history provide the lightweight audit trail.
- There is no authentication, role model, admin dashboard, or safe server-side admin action to extend. Governance is enforced through repository review and `npm run content:audit`.

## Intentional handling

Nothing in categories C–E was deleted or presented as verified. Records should remain draft until an authoritative source exists, become `outdated` only when historical public context is useful, or become `archived` when they should be retained but no longer exposed.
