/**
 * Monthly reverification check. Usage: node scripts/check-reverification.mjs [--dry-run]
 * Honors CONTENT_REVERIFY_MONTHS (default 12). Hotlines, officials and contact
 * records are always due every 3 months.
 */
import process from 'node:process';
import { loadContentRecords } from './lib/content-records.mjs';
import { upsertIssue } from './lib/github-issues.mjs';
import { findDueRecords, reverificationIssue } from './lib/reverification.mjs';

const dryRun = process.argv.includes('--dry-run');
const defaultMonths = Number.parseInt(
  process.env.CONTENT_REVERIFY_MONTHS || '12',
  10
);
const due = findDueRecords(loadContentRecords(), { defaultMonths });

console.log(`${due.length} record(s) due for reverification`);
for (const item of due)
  console.log(`- ${item.contentId} (${item.months}-month interval)`);
if (dryRun) process.exit(0);

for (const item of due) {
  const issue = reverificationIssue(item);
  const outcome = await upsertIssue({
    repo: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
    ...issue,
  });
  console.log(
    `${issue.title}: ${outcome.action}${outcome.number ? ` #${outcome.number}` : ''}`
  );
}
