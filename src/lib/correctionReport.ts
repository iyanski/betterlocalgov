import { isSafeHttpUrl } from './contentGovernance';

export const CORRECTION_REASONS = [
  'Incorrect information',
  'Outdated information',
  'Broken or unsuitable source',
  'Missing context',
] as const;

export interface CorrectionReportInput {
  page: string;
  reason: string;
  correction: string;
  sourceUrl: string;
  website: string;
}

export function validateCorrectionReport(
  input: CorrectionReportInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.page || input.page.length > 300) {
    errors.page = 'Enter a page reference of 300 characters or fewer.';
  }
  if (
    !CORRECTION_REASONS.includes(
      input.reason as (typeof CORRECTION_REASONS)[number]
    )
  ) {
    errors.reason = 'Choose a report reason.';
  }
  if (input.correction.length < 10 || input.correction.length > 2000) {
    errors.correction = 'Describe the issue in 10 to 2,000 characters.';
  }
  if (input.sourceUrl && !isSafeHttpUrl(input.sourceUrl)) {
    errors.sourceUrl = 'Use a valid HTTP or HTTPS source URL.';
  }
  if (input.website) errors.form = 'The report could not be prepared.';

  return errors;
}

export function buildCorrectionIssueUrl(
  input: CorrectionReportInput,
  issueDestination: string,
  submittedAt = new Date().toISOString()
): string {
  if (!isSafeHttpUrl(issueDestination)) {
    throw new Error('Correction issue destination must use HTTP or HTTPS.');
  }

  const body = [
    `**Page/content reference:** ${input.page}`,
    `**Reason:** ${input.reason}`,
    `**Suggested correction:**\n${input.correction}`,
    input.sourceUrl ? `**Supporting source:** ${input.sourceUrl}` : '',
    `**Prepared at:** ${submittedAt}`,
    '',
    '_Please do not include private personal information._',
  ]
    .filter(Boolean)
    .join('\n\n');
  const issueUrl = new URL(issueDestination);
  issueUrl.searchParams.set('title', `[Content correction] ${input.page}`);
  issueUrl.searchParams.set('body', body);
  issueUrl.searchParams.set('labels', 'content-correction,new');
  return issueUrl.toString();
}
