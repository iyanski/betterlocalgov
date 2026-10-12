# Automation

One workflow, `.github/workflows/content.yml`, uses only the default `GITHUB_TOKEN`. No other secret is needed and none may be added.

| Job              | Runs                               | What it does                                                                                           |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `verify`         | Every pull request                 | `npm run content:audit`, `npm test`, `npm run lint`, `npm run build`.                                  |
| `source-links`   | Mondays 03:00 UTC, or manually     | Checks every source URL cited by a content record, then opens, updates or closes one issue.            |
| `reverification` | The 1st of each month, or manually | Opens one `Reverify: <content id>` issue per published record that is due, without duplicating issues. |

Run a scheduled job on demand from the Actions tab (Content → Run workflow → choose the task). Locally, `node scripts/check-source-urls.mjs --dry-run` and `node scripts/check-reverification.mjs --dry-run` print their findings without touching GitHub.

## Source link check

- Requests are sequential, at most one per host every two seconds, `HEAD` first and `GET` only when `HEAD` is refused, with an honest `BetterGattaranLinkChecker` user agent.
- Only `404`, `410` and DNS failures count as broken. Blocks (`401`, `403`, `429`), server errors, timeouts and certificate problems are reported as "could not be checked" and never as broken.
- Hosts known to refuse automated access are skipped, not worked around (`SKIPPED_HOSTS` in `scripts/lib/source-links.mjs`) and listed in the issue for a person to check in a browser. Add a host there when it starts returning 403 or a challenge page.
- A single issue titled "Source links need attention" (label `source-links`) is created when links are broken, updated on later runs, and closed when none remain.

## Reverification check

Hotlines, current officials (mayor, elected officials, executive, legislative) and contact or directory records are due every 3 months. Everything else follows `CONTENT_REVERIFY_MONTHS` (repository variable, default 12). Only `published` records are considered; a record with no valid `lastVerifiedAt` is always due. See [Content verification](content-verification.md#reverification).
