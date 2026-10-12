function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const contentGovernanceConfig = {
  allowSourcedContent: import.meta.env.VITE_ALLOW_SOURCED_CONTENT !== 'false',
  correctionReportsEnabled:
    import.meta.env.VITE_CORRECTION_REPORTS_ENABLED !== 'false',
  correctionIssueUrl:
    import.meta.env.VITE_CORRECTION_ISSUE_URL ||
    'https://github.com/ginxFromYt/bettergattaran/issues/new',
  reverificationIntervalMonths: positiveInteger(
    import.meta.env.VITE_CONTENT_REVERIFY_MONTHS,
    12
  ),
};
