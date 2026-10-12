/**
 * Weekly source-link check. Usage: node scripts/check-source-urls.mjs [--dry-run]
 * Needs GITHUB_REPOSITORY and GITHUB_TOKEN to open or update the issue.
 */
import process from 'node:process';
import { loadContentRecords } from './lib/content-records.mjs';
import { upsertIssue } from './lib/github-issues.mjs';
import {
  checkAll,
  collectSourceUrls,
  sourceLinksIssue,
} from './lib/source-links.mjs';

const dryRun = process.argv.includes('--dry-run');
const results = await checkAll(collectSourceUrls(loadContentRecords()));
const issue = sourceLinksIssue(results);

console.log(issue.body);
if (dryRun) process.exit(0);

const outcome = await upsertIssue({
  repo: process.env.GITHUB_REPOSITORY,
  token: process.env.GITHUB_TOKEN,
  title: issue.title,
  body: issue.body,
  labels: issue.labels,
  closeWhenResolved: true,
  resolved: !issue.hasProblems,
});
console.log(
  `Issue ${outcome.action}${outcome.number ? ` #${outcome.number}` : ''}`
);
