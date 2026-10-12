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
        "asOf": "YYYY-MM-DD"
      }
    ]
  }
}
```

Optional dates should be omitted when the source does not supply them. Never substitute `lastUpdatedAt` for `lastVerifiedAt`. Internal review ownership and notes belong in `governance/content-register.json`, which the frontend does not import. Important actions belong in `governance/revisions.json`; normal file changes also remain attributable through Git history.

## Workflow

1. Create or edit the Markdown, index entry, and companion JSON as `draft` + `awaiting_verification`.
2. Record each source and its true category. Do not invent missing dates.
3. Review the fact, source currency, wording, and conflicts.
4. Set the record to `sourced` or `verified`; record `lastVerifiedAt` only after an actual check.
5. Add/update the internal content register and revision entry.
6. Change the companion and index entry to `published` in the same reviewed change.
7. Run `npm run content:audit`, tests, lint, and build.

Mark uncertain current information `outdated`, or move it to `draft`/`archived` when it should no longer be public. Prefer archival to destructive deletion when the record has civic or review value.

## Reverification

`CONTENT_REVERIFY_MONTHS` controls the repository audit interval; `VITE_CONTENT_REVERIFY_MONTHS` makes the same interval available to the frontend. The default is 12 months. The audit warns rather than deletes when a record is due. High-risk contacts, fees, schedules, procedures, emergency information, and current officials should be reviewed more often.

## Corrections

Public pages link to a correction form that validates lengths and HTTP(S) source URLs, uses a honeypot field, collects no name or email, and prepares a GitHub issue. GitHub provides authentication and abuse controls. Maintainers should apply `new`, `reviewing`, `resolved`, or `rejected` labels. Reporter information is never rendered by Better Gattaran.

## Security boundary

There is no admin endpoint or client-authorized verification action. Only reviewed repository changes can alter lifecycle metadata. Do not add secrets, tokens, private notes, or personal data to the repository. Search indexing uses the same public-visibility policy as page listings and direct routes.
