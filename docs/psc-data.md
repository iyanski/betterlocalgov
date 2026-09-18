# PSC transparency-seal data pipeline — status

**Last updated:** 18 September 2026

Turning the Philippine Sports Commission's Transparency Seal disclosures — 13 years
of budget, spending, revenue and procurement, published only as scanned PDFs — into
committed CSV/JSON and into data story pages under `/data/*`.

Nothing here is committed yet. `data/raw/` and `data/derived/_work/` are gitignored;
everything else under `data/` is meant to be committed.

---

## Where we are

|                                                | Status                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Document catalogue                             | ✅ done — 190 links, 178 unique URLs, 170 in scope                                 |
| Acquisition                                    | ✅ done — **142 of 170** in-scope documents, 365 MB, 929 pages, all hash-verified  |
| Dead-link recovery                             | ⚠️ blocked — archive.org rate-limits (429 on every request)                        |
| Render + OCR                                   | ✅ done for FAR No.1 (179 pages) and FAR No.5 (37 pages); other series not yet run |
| FAR No.1 extraction                            | ⚠️ **61% of rows balance** — geometry solved, digit errors remain                  |
| FAR No.5 extraction                            | ✅ **85% of rows balance**, and every published figure is cross-read               |
| Vision verification                            | ✅ run for the FAR No.1 headline rows, all 10 years; not yet for detail rows       |
| Shared chart components                        | ✅ done                                                                            |
| `/data` index + navigation                     | ✅ done                                                                            |
| `/data/participation`                          | ✅ live (refactored onto shared components, no visual change)                      |
| `/data/revenue` ("Where the money comes from") | ✅ live — FY2017–FY2026 from FAR No.5                                              |
| `/data/budget` ("Ten years of money")          | ✅ live — FY2017–FY2026, all 10 years cross-read from the page images              |
| Other four story pages                         | ⛔ not started                                                                     |

---

## The corpus

**142 live documents / 365 MB / 929 pages**, covering FY2013–FY2026.

| Series                                  | Live      | What it carries                                                                                                                |
| --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `far1`                                  | 10        | SAAOBDB: appropriations → allotments → obligations → disbursements → balances, per programme and expense class. **The spine.** |
| `far4`                                  | 10        | Disbursements by mode (MDS cheques, direct debit, cash advance, tax remittance)                                                |
| `far5`                                  | 10        | Revenue by source vs BESF target — the PAGCOR/PCSO share under RA 6847                                                         |
| `bar1`                                  | 10        | Physical targets vs reported accomplishment                                                                                    |
| `financial-plan`                        | 10        | Planned spend for the year                                                                                                     |
| `psc-budget` / `targets-mfo`            | 8 / 8     | DBM-approved budget and its attached targets                                                                                   |
| `app` family                            | 38        | Annual Procurement Plans, supplements, monitoring reports                                                                      |
| `programs` / `status-of-implementation` | 8 / 9     | Programme lists and implementation status                                                                                      |
| `pbb` / `foi` / `apcpi`                 | 7 / 6 / 1 | Performance bonus scorecards, FOI reports                                                                                      |

### 28 of the PSC's own links do not resolve

A finding in its own right, and the basis of a section on `/data/sources`:

- **20 on `www.web.psc.gov.ph`** — a host the agency retired. Everything FY2013–FY2016.
- **8 are 404s on the live host** — hashed-directory URLs (`/163657ecfe8f34/`) for the
  FY2022–23 procurement plans. Current-era documents the site simply lost.
- **1 malformed link**, repaired: the `app-2022` href is written twice and concatenated.
  Splitting it at the second `https://` retrieves the file. Recorded as a repair, not
  passed off as a clean fetch.

**Nothing before FY2017 resolves at all.** FY2013–FY2016 have zero live documents — the
entire pre-2017 record is gone from the agency's own index.

Also worth noting: PSC lists the **same** `ProgramsandProjects.pdf` as the programmes
document for FY2023, 2024, 2025 _and_ 2026. Identical SHA-256 four times.

`data/manifest/summary.json` carries a derived `findings` block — first online year,
the retired-host and 404 breakdowns, live-vs-missing by year, and production metadata.
These are derived rather than written into JSX so the `/data` pages rewrite themselves
on the next ingest run, or say plainly that a gap has closed.

---

## Running the pipeline

```bash
npm run psc:catalog    # 00 - build data/catalog/documents.json from harvested links
npm run psc:ingest     # 01 - move downloads into data/raw/, verify hashes, build manifest
npm run psc:wayback    # 01b - try archive.org for the 28 dead links
npm run psc:render     # 03+04 - pdftoppm at 300dpi, then Vision OCR   (--series far1)
npm run psc:far1       # 06 - reconstruct FAR No.1 tables, cross-foot them
npm run psc:far5       # 07 - reconstruct FAR No.5 tables, cross-foot them
npm run psc:revenue    # 08 - reconcile FAR No.5 into data/derived/revenue/series.json
npm run psc:verify     # 09 - cut verification strips             (--top-band)
npm run psc:test       # unit tests for number parsing and repair
```

**The build must never depend on any of this.** The pipeline needs macOS Vision and a
signed-in browser; CI has neither. That is exactly why derived outputs are committed.

### Acquisition is browser-only, and needs a Chrome permission

Cloudflare 403s every shell HTTP client on `psc.gov.ph` — curl and wget are refused on
the HTML page and on every PDF, with any header set, on both hosts. Bytes can only be
fetched from inside a real browser session.

Getting them _out_ is the other half. Three routes were tried:

| Route                           | Result                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| POST to a local receiver        | ❌ Chrome's Private Network Access rules drop it in the renderer; it never reaches the server          |
| postMessage bridge via a popup  | ❌ works, but it's a byte-forwarding channel injected into a third-party page — wrong shape, abandoned |
| `<a download>` to `~/Downloads` | ✅ **in use** — requires Automatic downloads = Allow for psc.gov.ph                                    |

Note `scripts/psc-data/receiver.mjs` remains useful for local→local transfers (private
to private is permitted), which is how DOM snapshots were extracted for the refactor
regression test.

**Gotcha:** the permission is per Chrome _profile_. It was first granted in the
"StatsCentral" profile while the automation runs in "Ian" — 45 minutes lost. Confirm
with a probe download before starting a batch.

The page-side SHA-256 travels in the filename (`psc__<docId>__<sha16>.pdf`) because no
side channel exists; `01-ingest` re-hashes on disk and **stops the run** on a mismatch.

---

## Extraction: what works and what doesn't

### Solved: column geometry

Each page independently resolves exactly **22 money columns** — correct, since the
24-column form has two non-money columns (Particulars, UACS code). Getting there took
three fixes, each worth keeping in mind:

1. **Right edges, not centres.** Financial columns are right-aligned: every figure in a
   column shares a right edge to the pixel, while left edges wander with magnitude.
   Centre-clustering smears adjacent columns together as soon as one holds both `0.00`
   and `1,156,452,000.00`.

2. **Per-page, not pooled.** Pages drift ~8 px against each other from scan
   registration. A statement-wide template therefore sits a few pixels off every page,
   which is enough to throw a token into the neighbouring column. Pooling survives only
   as the fallback for a page too sparse to resolve its own columns.

3. **Partition, don't pick the nearest.** "Nearest column within tolerance" lets two
   tokens claim one column while the column between them is reported blank. The page is
   now partitioned into intervals; a token lands in exactly one.

### Solved: two OCR pathologies

- **Fragmentation.** Where the scan is faint Vision drops the commas and emits
  `"30.171" "752" "10"` instead of `30,171,752.10`. The tell is geometric and stark:
  fragments sit **1 px** apart, while the narrowest genuine column gap measured **6 px**
  on the same page. Merged on that, guarded by requiring the result to be well-formed
  money _and_ at least one fragment not to have been whole already.
- **Welding.** The inverse — two adjacent cells read as one token
  (`1,156,452,000.001,156,452,000.00`). Split at the `.dd`-followed-by-digit seam, and
  laid into the N columns _ending_ at the one the token's right edge falls in. Splitting
  by character count does not work: the inter-column gap is inside the token's span.

### Fixed: the repair path was fabricating numbers

Given a welded token, the "multiple decimal points" repair turned it into a well-formed
**22-digit** figure and reported it as data. Repairs are now capped at 13 integer
digits — past the national budget, so past anything that can be a misread peso amount.
This was live and producing fabricated figures; worth remembering when adding new repair
rules. **A repair must never be able to invent a plausible number.**

### Abandoned: rule-line detection

The plan leaned on the printed grid for exact column boundaries. On these scans the
lines are too faint and broken to survive any threshold/morphology combination — a
`1x60` vertical opening leaves ~160 set pixels on a 9.9-megapixel page. Four parameter
sets were swept before concluding it's the scans, not the tuning. `lib/pgm.mjs` is kept
in case a better-scanned series has usable rules.

### Solved differently: FAR No.5 columns come from the header

FAR No.1's trick — pool the right edges of every money token and let the columns fall
out — does not work on FAR No.5. Five of its eleven figure columns are blank top to
bottom in most years, so the number of populated columns swings between 5 and 10 across
the series and a cluster count says nothing about _which_ columns were found.

`07-far5.mjs` anchors on the printed header instead, pooling four families of caption:
the column-number strip the form prints above its first data row (`3 4 5 ...
8=(4+5+6+7) ... 14`), the quarter captions and the month under each, `BTr`/`AGDB`, and
`TARGET`/`(Annual)`/`BESF`. No family survives every scan — FY2021 lost its whole
left-hand header, FY2024 lost the strip, FY2022 reads column 11 as `11=(8+10)` — but
between them every page is covered, and where they overlap they agree to a few pixels.
Missing columns are interpolated between the anchors either side, and the run is
rejected outright if the anchors do not ascend.

Two details carried the accuracy from 13% to 85%:

- **Boundaries are the neighbouring column's centre, not the midpoint.** Figures are
  right-aligned, so the widest figure in a column crosses the midpoint and lands one
  column right. That single change fixed FY2021's revenue target, which had been read
  as its first-quarter collection.
- **Row grouping at `gapFactor` 0.4, not 0.6.** Rows sit ~37px apart with up to 18px of
  intra-row scatter, so the default tolerance chains one row into the next — FY2021's
  rent and PAGCOR lines came out as one row labelled "Share Rent/Lease from PAGCOR".

### The redundancy that makes it publishable

Digit errors remain (see below), but FAR No.5 has an unusual defence against them: the
PSC prints every figure many times. Each annual PDF holds four statements, one per
quarter ending, each cumulative from January — so a first-quarter collection appears in
four separate scans — and the form repeats every total down its own hierarchy
(Internally Generated Funds = Revenue Collections = Cash Receipts = Non-Tax = TOTAL).

`08-revenue.mjs` votes. 664 readings across the series produce one series of figures,
with a reading from a row that satisfies its own arithmetic counting double — which is
what rescued FY2020's PAGCOR target, read three different ways by three statements, the
plurality answer being a decimal order of magnitude out. Where a scan lost one quarter
under a printed total, the form's own column 8 supplies it; both cells recovered that
way (FY2017 Q3, FY2026 Q2) match the page image to the centavo.

Every year in the series now balances on all three identities, and each figure carries
its vote count into `series.json` and onto the page.

### Not solved: digit accuracy

**61% of rows balance** across all ten FAR No.1 documents (1,683 rows; 764 exact, 62
within ₱1, 529 fail, 328 not checkable).

Ground-truthed against the FY2024 page image, the agency-total row had **3 errors in 22
cells** — and cross-footing caught all three:

|                        | Extracted      | Page               |
| ---------------------- | -------------- | ------------------ |
| Obligations Q3         | 178,584,647.76 | **176,584,647.76** |
| Obligations total      | 885,771,729.20 | **685,771,729.20** |
| Unobligated allotments | _(dropped)_    | **470,680,270.80** |

The quarters sum to 685,771,729.20 exactly, and allotments minus obligations gives
470,680,270.80 exactly. **The validation works.** No amount of geometry fixes a 6 read
as an 8 — only re-reading the page does.

Four documents still resolve no statements at all: **FY2017, FY2018, FY2025**, and parts
of FY2022/2023/2024/2026. Those need layout profiles or a different page segmentation.

**Why layouts vary so much:** no two FAR No.1 documents in ten years share a page size.

| FY   | Page size          |     | FY   | Page size           |
| ---- | ------------------ | --- | ---- | ------------------- |
| 2017 | 612 × 1008 pts     |     | 2022 | 938.4 × 615.12 pts  |
| 2018 | 613 × 902 pts      |     | 2023 | 936.96 × 612.96 pts |
| 2019 | 605 × 912 pts      |     | 2024 | 937.44 × 610.08 pts |
| 2020 | 612.25 × 902.4 pts |     | 2025 | 937.68 × 609.6 pts  |
| 2021 | 1008 × 612 pts     |     | 2026 | 937.92 × 611.28 pts |

The same holds for FAR No.5 and BAR No.1 — ten documents, ten distinct page sizes each,
one of them 2400 × 1638. Across the live corpus there are **36 distinct PDF producers**
(Epson Scan 2, Adobe Acrobat Pro 11, iLovePDF, Word, Excel) and 42 documents with no
producer recorded. This is not one archive; it is a decade of separate digitisation
efforts, which is why a single geometric model does not carry across years.

### The verification design

`09-verify-crops.mjs` cuts the rows that matter into left/right half-strips at a
resolution where digits are unambiguous (proven by reading them back). Two rules:

- The queue **excludes the OCR values**. A reader shown the machine's answer confirms
  it; the value of a second read is that it is independent. Comparison happens in a
  later stage.
- Targets are every total/sub-total/grand-total row unconditionally, every row failing
  an identity, plus the top band of each statement's first page.

The budget page needs roughly ten rows per year — agency total, programme rows,
PS/MOOE/CO splits. **~14 images**, not 1,683 rows to perfect.

---

## Frontend

### Shared components (done)

Lifted out of the 905-line `Participation.tsx`, which is now 616 lines and renders
**identically** — verified by diffing the rendered DOM with class-attribute order
normalised. The only differences are `scope="col"`, `sr-only` captions, and prose moved
into a styled wrapper with equivalent spacing. The SVG charts don't appear in the diff
at all.

- `src/components/charts/` — `chartKit.ts`, `BarList`, `ColumnChart`, `StackedBar`,
  `GroupedBars`, `ChartLegend`, `DataTable`, plus new marks `TrendChart`, `Waterfall`,
  `StackedColumns`
- `src/components/story/` — `Eyebrow`, `SectionHeading`, `Note`, `SourceNote`,
  `StoryHero`, `extraction.ts`

**Conventions worth keeping:** at most three categorical series per chart (only
primary-600/accent-600/secondary-600 are checked for colour-vision separation);
`TrendChart` breaks its line across a missing year rather than interpolating;
`StackedColumns` prints "no document" rather than a zero-height bar. `ColumnChart` takes
`tickMode="data"` to preserve the original age-histogram scaling.

Still to build: `BulletBar`, `Dumbbell`, `Slope`, `Heatstrip`, `SmallMultiples`.

### Surfaces (done)

All four read from `src/data/psc/stories.ts`:

1. `/data` index — cards per story, counts from `data/manifest/summary.json`
2. Navbar dropdown, 3. Footer _Data_ column — **live stories only**; an unregistered
   route falls through to the document viewer's "not found"
3. Home `DataStories` teaser

### Other frontend changes

- **Lazy routes**: entry chunk **1,278 kB → 258 kB** (gzip 354 → 81 kB)
- **Canonical URLs** were all pointing at the site root. Now derived from the route —
  but read `VITE_CANONICAL_ORIGIN`, _not_ `VITE_WEBSITE_URL`, which is set to
  `https://psc.gov.ph`, the agency's own domain. Canonicalising there would ask search
  engines to drop this site in favour of theirs. Unset, canonicals are relative and
  resolve to whatever origin serves the page. **Set `VITE_CANONICAL_ORIGIN` before
  deploying.**

---

## Next steps

1. **Run the vision verification** on the ~14 top-band strips → verified figures for the
   FAR No.1 spine across all ten years.
2. **Build `/data/budget`** on those figures. Sections are specified in the plan:
   the thirteen-year line, the funnel (`Waterfall` — FAR No.1's structure _is_ a
   waterfall), utilisation rate, PS/MOOE/CO composition, the money that never arrived.
3. Layout profiles for FY2017, FY2018, FY2025.
4. Retry Wayback for the 28 dead links, slowly.
5. Run render+OCR for `bar1` and `far4`. `far5` is done.
6. Wire Meilisearch — `scripts/index-content.mjs` can import `stories.ts` directly
   rather than parsing TSX. Add a sitemap; the mobile nav already links `/sitemap` and it
   goes nowhere.

## Known data gaps

Both are surfaced by `npm run psc:test`, which lists them as KNOWN and fails on
anything new. Neither is a wrong figure; both are gaps in the reading.

- **FY2020, sale of unserviceable property.** The line was never read, so the
  source lines fall short of the printed grand total by exactly ₱1,001,000.00 —
  which is that line. The grand total is printed and corroborated.
- **FY2018, interest income.** The printed annual total (₱1,976,221.22) is
  corroborated: all six source lines sum exactly to the printed grand total. The
  four quarters sum to ₱1,271,516.63, so one _quarter_ is misread. The annual
  figure is safe; that quarterly split is not.

Fixing the first properly belongs in `08-revenue.mjs`, which should derive a
single missing source line when the grand total and every other line are known,
and mark it `basis: 'derived'`.

## Known issues

- `i18next` requests `/locales/en-US/common.json`, which does not exist — only
  `/locales/en/`. Fallback covers it, but it fails on every page load. Fix with
  `load: 'languageOnly'`.
- `useTranslation` chunk is **607 kB** (152 kB gzipped). Pre-existing, not investigated.
- `CLAUDE.md` is stale: one flat `categoryIndexMap` (no `govCategoryIndexMap`), `Card`
  comes from `@bettergov/kapwa/card`, there is no `ListItem`, and there are now 12 routes.
- `data/derived/_work/` is 655 MB of page renders. Safe to delete; `psc:render` rebuilds.
