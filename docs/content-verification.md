# Content governance and verification

Better Gattaran is independent and is not the official website of the Municipality of Gattaran. This policy applies to all public-information records.

## Lifecycle

Publication and verification are intentionally separate.

| Publication status | Meaning                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| `draft`            | Work in progress; hidden from public listings, direct routes, and search. |
| `published`        | Public only when the verification state is eligible.                      |
| `archived`         | Retained for history; hidden from public routes and search.               |

| Verification status     | Meaning                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `awaiting_verification` | No adequate review has been completed. Cannot be published.                     |
| `sourced`               | A public source is recorded, but the portal has not independently confirmed it. |
| `verified`              | A maintainer checked the record against the recorded source.                    |
| `outdated`              | The record is explicitly identified as potentially non-current.                 |

`VITE_ALLOW_SOURCED_CONTENT=false` prevents sourced records from displaying even when their publication status is `published`.

### One visibility policy

The rules above are implemented once, in `scripts/lib/visibility.mjs`. The app (through `src/lib/contentGovernance.ts`), the pre-renderer, the sitemap, What's new, the build's draft exclusion, the search indexer and the audit all use it. Do not copy the rules elsewhere.

### Non-public content never ships

Hiding a record is not enough: the document viewer loads content through dynamic imports, which would otherwise bundle every file under `content/` as a downloadable JS chunk. In production builds (`npm run build`):

- a Vite plugin (`scripts/lib/content-visibility-plugin.mjs`) replaces every non-public Markdown file and record JSON in `content/services`, `content/government`, `content/hotlines` and `content/projects` with an empty draft stub, and removes non-public entries from category `index.yaml` files;
- `scripts/check-dist-leaks.mjs` then scans everything in `dist/` and fails the build if text from any non-public record, hidden index entry or `content/request-drafts/` file appears there.

`npm run dev` still shows drafts locally so maintainers can preview them. A draft may therefore contain working text, but keep unverified personal information out of the repository altogether: the repository itself is public.

## Source types

Use one controlled value for every source: `lgu_official`, `national_government`, `provincial_government`, `official_government_publication`, `official_government_social_media`, `public_document`, or `other_public_source`. A third-party source must never be labeled official.

Prefer Municipality of Gattaran sources, then official Philippine government publications and agencies, then the Provincial Government of Cagayan. Directories, search snippets, blogs, scraped lists, reposts, and ordinary third-party sites may help discovery but are not authoritative by themselves.

## Public metadata

Every published Markdown page needs a same-name JSON companion:

```json
{
  "publicationStatus": "published",
  "provenance": {
    "verificationStatus": "verified",
    "lastVerifiedAt": "YYYY-MM-DD",
    "lastUpdatedAt": "YYYY-MM-DD",
    "asOf": "YYYY-MM-DD",
    "sources": [
      {
        "title": "Source title",
        "organization": "Issuing organization",
        "url": "https://government.example/page",
        "type": "national_government",
        "publishedAt": "YYYY-MM-DD",
        "asOf": "YYYY-MM-DD",
        "locator": "p. 47, Part II, Observation 3"
      }
    ]
  }
}
```

Optional companion fields: `scope` (`local` by default, or `national_applicable`) and `containsFigures` (`true` when the page reproduces figures or audit observations).

Optional dates should be omitted when the source does not supply them. Never substitute `lastUpdatedAt` for `lastVerifiedAt`. Internal review ownership and notes belong in `governance/content-register.json`, which the frontend does not import. Important actions belong in `governance/revisions.json`; normal file changes also remain attributable through Git history.

## Content scope

`scope` is `local` unless the companion JSON says otherwise. A `national_applicable` page describes a national program or procedure (for example PSA civil registry documents or PhilHealth) that applies in Gattaran, using only the national agency's own published source.

- It must cite at least one `national_government` or `official_government_publication` source. The audit fails otherwise, and the page is withheld at runtime.
- It always renders a fixed, non-dismissible notice: "This is a national government procedure that applies in Gattaran. Local office locations, hours, contacts and any local fees have not been verified by Better Gattaran. Confirm with the issuing agency."
- It must not state local office addresses, schedules or fees. Those need a separate `local`-scope record with its own source.
- The national agency is shown as the source organization.

## Figures and locators

Every source on a record with `"containsFigures": true` needs a `locator` that points to the exact place in the source (page and section, or table and row, such as `Table 2, row 'Real Property Tax'`). The audit fails when a locator is missing.

- Figures and audit observations may be summarized only with a locator.
- Figures must be reproduced exactly as published, with year, unit and fund. Do not round, convert or restate them.
- No derived claims are allowed beyond simple arithmetic whose inputs and result are both shown on the page.
- Summaries of audit findings use attributed wording ("COA observed / recommended ...") with the report page or section reference. Characterizations such as "anomaly" or "misuse" appear only when quoted from the report and cited.
- Every page that summarizes an official finding includes a right-of-reply line pointing to the correction form.

## Workflow

1. Create or edit the Markdown, index entry, and companion JSON as `draft` + `awaiting_verification`.
2. Record each source and its true category. Do not invent missing dates.
3. Review the fact, source currency, wording, and conflicts.
4. Set the record to `sourced` or `verified`; record `lastVerifiedAt` only after an actual check.
5. Add/update the internal content register and revision entry.
6. Change the companion and index entry to `published` in the same reviewed change.
7. Run `npm run content:audit`, tests, lint, and build.

Mark uncertain current information `outdated`, or move it to `draft`/`archived` when it should no longer be public. Prefer archival to destructive deletion when the record has civic or review value.

## Information-request log and What's new

- **Request log.** `content/requests/*.json` holds requests the maintainers have actually sent, shown on `/foi-requests`: agency or office, channel (`efoi`, `letter`, `email`), date sent, subject, status (`pending`, `acknowledged`, `granted`, `partially_granted`, `denied`, `no_response`), optional response date and public eFOI link. The requester is always "Better Gattaran maintainers". Wording is neutral. A published request needs a sent date and an internal register entry.
- **Seed drafts.** `content/request-drafts/*.json` are unfiled drafts for maintainers to send. They carry no sent date, are not published, and live outside `content/requests/` so they are not bundled. Move a draft to `content/requests/` only after it has been sent.
- **What's new.** The build writes `whats-new.json`, the `/whats-new` page, the homepage teaser and the footer "Content last updated" date from `governance/revisions.json`. Only revisions of records that pass the public-visibility policy appear, so changes to drafts and blocked records are never listed.

## Reverification

`CONTENT_REVERIFY_MONTHS` controls the repository audit interval; `VITE_CONTENT_REVERIFY_MONTHS` makes the same interval available to the frontend. The default is 12 months. The audit warns rather than deletes when a record is due. High-risk contacts, fees, schedules, procedures, emergency information, and current officials should be reviewed more often.

## Corrections

Public pages link to a correction form that validates lengths and HTTP(S) source URLs, uses a honeypot field, collects no name or email, and prepares a GitHub issue. GitHub provides authentication and abuse controls. Maintainers should apply `new`, `reviewing`, `resolved`, or `rejected` labels. Reporter information is never rendered by Better Gattaran.

## Security boundary

There is no admin endpoint or client-authorized verification action. Only reviewed repository changes can alter lifecycle metadata. Do not add secrets, tokens, private notes, or personal data to the repository. Search indexing and the production bundle use the same public-visibility policy as page listings and direct routes.
