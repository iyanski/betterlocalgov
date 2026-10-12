# Better Gattaran — Phase 4 agent brief

You are working in the Better Gattaran repository (https://github.com/ginxFromYt/bettergattaran), a static React 19 + TypeScript + Vite civic information portal for Gattaran, Cagayan, deployed at https://bettergattaran.org/. It is independent and is NOT the official Municipality of Gattaran website.

The LGU has not responded to requests for information. Phase 4 grows the portal using lawful, attributable **public national and provincial government sources**, without weakening the project's verification model.

## 0. Read first, then establish a baseline

Before changing anything, read:

- `README.md`
- `CLAUDE.md`
- `docs/content-verification.md`
- `docs/content-inventory.md`
- `docs/sources.md`
- `src/lib/contentGovernance.ts`
- `scripts/audit-content.mjs`
- `governance/content-register.json`
- `governance/revisions.json`

Then run:

```bash
npm install
npm run content:audit
npm test
npm run lint
npm run build
```

Record the results in your first progress note. If anything fails before you change a line, fix it in a separate first commit, or report it and stop.

## Non-negotiable rules

These override anything below.

1. **Never invent or infer facts.** Every public fact must come from a source you actually opened during this session. Do not use memory, search snippets, another locality, Wikipedia, unverified Facebook pages, directories or map listings. If you cannot open a source, the record stays `draft` + `awaiting_verification`, and you list it in the human-review handoff (section 9).

2. **Never invent dates.** Leave out `publishedAt` and `asOf` when the source does not state them. Set `lastVerifiedAt` only to the date you actually checked the source.

3. **Do not set `verified` on your own.** You may set `sourced` and `published` only for official government sources you opened and checked against the exact wording you publish. Record yourself as the checker in `governance/content-register.json` notes (e.g. "Agent-checked YYYY-MM-DD; needs maintainer confirmation"). `verified` is applied only by a human maintainer at review. Note that `VITE_ALLOW_SOURCED_CONTENT` gates whether sourced records display.

4. **Label every source honestly.** Use only the controlled source types. Media such as Rappler is `other_public_source`, never official.

5. **Do not get around bot protection.** If a site blocks automated access (e.g. DPWH serves an Incapsula challenge), do not use mirrors, caches, alternate user agents or headless tricks. Add the URL to the human-retrieval list in section 9.

6. **Respect personal data.**
   - Publish officials only in their public role: name, position, term, and source.
   - Never publish personal contact numbers unless an official source lists them as an office line.
   - Never publish private individuals, beneficiary lists, bidders' personal details, or anything from the Data Privacy Act's sensitive categories.

7. **Keep wording neutral and attributable to avoid libel and cyberlibel risk.**
   - Describe audit content as "COA observed / recommended …" with the exact page or section reference.
   - Do not characterize anything (no "anomaly", "corruption", "misuse") unless that is COA's own published wording, quoted and cited.
   - Every page that summarizes an official finding includes a right-of-reply line pointing to the correction form.

8. **Use government works non-commercially with attribution.** RA 8293 §176 applies. Do not copy third-party media text; link and paraphrase briefly.

9. **Keep the independence disclaimer on every page.** Nothing may imply the site speaks for the LGU.

10. **No secrets or private data.** Do not commit tokens or private reporter information. Do not add a backend.

## Working method

- One branch and one PR per workstream: `content/gattaran-phase-4-<topic>` or `feat/phase-4-<topic>`.
  - Commit messages are conventional (`feat:`, `content:`, `chore:`, `docs:`).
  - Every PR description lists sources added, records changed, and items for human review.
- After each workstream, run `npm run content:audit && npm test && npm run lint && npm run build`. Do not open a PR with failures.
- Add or extend tests for every change to governance logic, loaders or audit rules.
- Update `docs/sources.md` with every source you accepted **or rejected**, and why. Update `docs/content-inventory.md`, `governance/content-register.json` and `governance/revisions.json` in the same change as the content.
- Stop and ask the maintainer before deleting anything that is not listed in section 1, or before changing deployment or DNS config.

## 1. Clean up inherited demo content

- Remove the 15 Lapu-Lapu/Cebu starter Markdown files under `content/services/**` and the empty market-stall file. Git history preserves where they came from.
- Remove `index.yaml` entries that describe hypothetical services with no Gattaran or national source. Keep the category files.
- Remove dead starter-kit leftovers that are unused, e.g. `src/components/I18nTest.tsx` and `src/assets/react.svg`. Confirm with grep first.
- Update `docs/content-inventory.md` section E.
- Acceptance: the audit passes, no route or test references the removed files, and category pages render the intentional empty state.

## 2. Extend the governance schema

### 2a. National services that apply in Gattaran

Add a content scope field to companion JSON:

```json
"scope": "local" | "national_applicable"
```

The default is `local`, so existing records stay valid.

`national_applicable` pages describe a national program or procedure (PhilHealth, PSA civil registry documents, DSWD AICS, 4Ps, SSS, PhilSys National ID, DOLE TUPAD, LTO) using only the national agency's own published source. Each one must:

- Render a fixed, non-dismissible notice component:
  > "This is a national government procedure that applies in Gattaran. Local office locations, hours, contacts and any local fees have not been verified by Better Gattaran. Confirm with the issuing agency."
- Never state local office addresses, schedules or fees unless a separate `local`-scope record supports them.
- Show the national agency as the source organization.

Implement this in `src/lib/contentGovernance.ts` and the audit script, including:

- Validation that `national_applicable` records cite at least one `national_government` or `official_government_publication` source.
- A new `NationalScopeNotice` component, rendered by `Document.tsx`.
- Tests for all of the above.

### 2b. Locators for document summaries

Add an optional `locator` field to each source (e.g. `"p. 47, Part II, Observation 3"` or `"Table 2, row 'Real Property Tax'"`).

The audit must **require** `locator` on any source cited by a record whose companion JSON sets `"containsFigures": true`. Update `docs/content-verification.md` so that:

- Figures and audit observations may be summarized only with a locator.
- Figures must be reproduced exactly, with year, unit and fund.
- No derived claims are allowed beyond simple, shown arithmetic.

## 3. Pre-render pages and add social previews

Search engines and Facebook currently see only the page title.

- Add build-time pre-rendering for all public routes, e.g. `vite-react-ssg` or a post-build prerender step. Choose whichever fits React Router 8 with the fewest changes, and justify the choice in the PR.
- Pre-render only routes the visibility policy allows. Draft and archived content must never appear in the output, sitemap or search index. Reuse the same policy function.
- Give each page its own `<title>`, meta description, canonical URL, `og:title`, `og:description`, `og:image` (`public/bettergattaran.png` as default) and `og:url`.
- Generate `sitemap.xml` and `robots.txt` at build time.
- Check that `vercel.json`, `public/.htaccess` and the SPA fallback still work.
- Acceptance: `npm run build` emits real HTML body content for `/`, `/hotlines`, `/government/departments/municipality-overview` and every published record, and the sitemap lists only publicly visible routes.

## 4. New content from public government sources

For each item:

1. Open the source.
2. Create the Markdown, companion JSON (with `scope`, `provenance` and `locator` where needed) and index entries.
3. Add register and revision entries.
4. Publish according to the non-negotiable rules.

Prefer primary sources. Use third-party sources only as cross-checks.

### 4a. Elected officials, 2025–2028 term

Create a `government/departments/elected-officials` record covering the Vice Mayor and Sangguniang Bayan members.

- **Primary source:** COMELEC, i.e. the certified results or Certificate of Canvass and Proclamation, if publicly retrievable.
- **Cross-check only:** Rappler's 2025 local race page (https://ph.rappler.com/elections/2025/local-race/cagayan/gattaran), typed `other_public_source`.
- If only Rappler is available, the record stays `draft`. List it for human retrieval of a COMELEC or provincial source.
- Also re-check the mayor record against the current Provincial Government of Cagayan directory and COMELEC.
- Publish names and positions only.

### 4b. National government projects in Gattaran

Create a new government category `projects`, wired in `src/data/government.yaml` and `src/data/yamlLoader.ts` (`govCategoryIndexMap`).

- **Sources:**
  - DPWH news releases, e.g. https://dpwh.gov.ph/DPWH/news/31832 and https://dpwh.gov.ph/DPWH/news/26309
  - DPWH Cagayan 1st District Engineering Office Procurement Monitoring Reports and Annual Procurement Plans, e.g. https://dpwh.gov.ph/DPWH/sites/default/files/pmr/pmrsecondsemesterforfy2024dpwh-cagayan-1stdeocivilworks.pdf
- Store project rows as structured JSON (`content/projects/*.json`) with these fields: name, implementing agency, fund source and year, contract amount (exact), contractor (company name only), status as stated, barangay or location as stated, source and locator.
- Render a sortable table. The page header must state that these are national-agency projects located in Gattaran, not municipal projects.
- DPWH pages may be bot-protected. Follow non-negotiable rule 5: build the schema, component and tests, and add the URLs to the human-retrieval list. Do not fabricate rows.

### 4c. Fiscal transparency

Expand the `transparency-documents` category:

- **DILG Full Disclosure Policy Portal** (https://fdpp.dilg.gov.ph): link Gattaran's posted documents (annual budget, SRE, procurement, trust fund, 20% development fund utilization) with document title, period and posting date as shown.
- **BLGF / Statement of Receipts and Expenditures:** use data released through foi.gov.ph, e.g. https://foi.gov.ph/requests/statement-of-receipts-and-expenditures-of-local-government-units, to show income by source and NTA dependency over available years. Use `containsFigures: true` with locators, and draw charts from JSON.
- **COA Annual Audit Reports** (https://www.coa.gov.ph/reports/annual-audit-reports/aar-local-government-units/): for each available Gattaran year, add a summary page of COA's observations and recommendations, plus the management response status as COA reports it. Use exact locators, neutral wording and a right-of-reply line.
- **PhilGEPS:** link or list bid notices whose procuring entity is LGU Gattaran, with reference number, title, ABC and date as published. If PhilGEPS cannot be accessed without login or bot challenge, add it to the human-retrieval list.

### 4d. Competitiveness

Add a DTI CMCI record (https://cmci.dti.gov.ph/) with Gattaran's overall score, rank and pillar scores for each available year, as figures with locators, plus a small trend chart.

### 4e. Hazards and preparedness

Fill `services/disaster-preparedness` with:

- Links to official hazard tools: HazardHunterPH and GeoRiskPH, MGB geohazard maps, PAGASA advisories.
- Any Gattaran-specific hazard statements those agencies publish, quoted with a locator.
- No home-made hazard assessments.

### 4f. Facilities

Add public lists of health facilities in Gattaran from the DOH National Health Facility Registry, and schools from DepEd's public school lists. Include facility name, type, ownership and barangay only as the source states them. Contact details go in only if the source lists them as official office lines.

### 4g. National services that apply in Gattaran

Using the `national_applicable` scope from section 2a, write concise guides sourced only from each agency's official site. Start with:

- PSA birth, marriage and death certificates
- PhilSys National ID
- PhilHealth membership
- DSWD AICS
- DSWD 4Ps
- SSS membership
- DOLE TUPAD

Place them in the matching existing service categories.

## 5. FOI request log and "What's new"

- **FOI request log:** add a public page backed by `content/requests/*.json`. Each request records: agency or office asked, channel (eFOI on foi.gov.ph, letter or email), date sent, subject, status (`pending | acknowledged | granted | partially_granted | denied | no_response`), response date, and a link to the public eFOI request if one exists. Use neutral wording only. No requester personal data beyond "Better Gattaran maintainers".
- **Seed requests:** create draft entries the maintainer can file. Do not file them yourself. Target DILG, BLGF and COA for Gattaran-specific records: FDP documents, SRE, and audit reports not online. Also include the LGU itself, for a citizen's charter and office directory under RA 11032.
- **What's new:** add a page and a homepage teaser generated at build time from `governance/revisions.json`, listing only changes to publicly visible records. Show a site-wide "last updated" date in the footer.

## 6. Automation

Add a GitHub Actions workflow with three parts:

- **On PR:** content audit, tests, lint and build.
- **Weekly scheduled check of source URLs:** use HEAD/GET with polite rate limiting, and skip hosts known to block bots. If it finds broken links, it opens or updates a single issue.
- **Monthly reverification check:** open issues for records due for reverification. Hotlines, officials and contacts are due every 3 months; other records follow `CONTENT_REVERIFY_MONTHS`.

The workflow must use no secrets beyond the default `GITHUB_TOKEN`.

## 7. Weather resilience

- Confirm the weather API's cross-origin header (`Access-Control-Allow-Origin`) for `https://bettergattaran.org`, and document the result.
- Add a fallback provider, e.g. Open-Meteo, which needs no key, behind the existing weather service interface. Keep displaying the provider and observation time returned at runtime.
- Add a permanent link to PAGASA official advisories next to the weather card. Make clear the reading is not an official warning.
- Add tests for fallback behavior.

## 8. Languages

- Add an Ilocano (`ilo`) locale scaffold alongside `en` and `fil`, and a placeholder for Ibanag (`ibg`), but keep them disabled in the language switcher.
- Do not publish machine-translated civic content. UI strings may be drafted but must be marked `needs_review` and stay disabled until a human speaker approves them.

## 9. Final handoff

End with a single markdown report in the final PR description and as `docs/phase-4-handoff.md`. It must contain:

1. Baseline vs. final results of the audit, tests, lint and build.
2. A table of every record added or changed: content ID, scope, publication and verification status, sources.
3. **Human-retrieval list:** each URL you could not access (bot protection, login or download failure), with what it should provide.
4. **Human-verification list:** records you set to `sourced` that a maintainer should check and promote to `verified`.
5. Draft FOI requests ready to file.
6. Open questions and any rule you were unsure how to apply.

Prefer leaving something empty and listed in this report over publishing anything you could not check.
