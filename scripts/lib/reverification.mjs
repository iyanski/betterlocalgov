/** Records that carry current officials or contact details. */
const frequentPatterns = [
  /^hotlines\//,
  /(^|\/)(municipal-mayor|elected-officials|executive|legislative)(\/|$)/,
  /(^|\/)(contact|contacts|directory|offices)(\/|$)/,
];

export const FREQUENT_REVERIFY_MONTHS = 3;

export function reverifyMonthsFor(contentId, defaultMonths) {
  return frequentPatterns.some(pattern => pattern.test(contentId))
    ? Math.min(FREQUENT_REVERIFY_MONTHS, defaultMonths)
    : defaultMonths;
}

function addMonths(dateValue, months) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date;
}

/**
 * Returns published records that are due for reverification.
 * A record with no valid lastVerifiedAt is always due.
 */
export function findDueRecords(
  records,
  { now = new Date(), defaultMonths = 12 } = {}
) {
  return records.flatMap(({ contentId, file, record }) => {
    if (record.publicationStatus !== 'published') return [];
    const months = reverifyMonthsFor(contentId, defaultMonths);
    const lastVerifiedAt = record.provenance?.lastVerifiedAt;
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(lastVerifiedAt ?? '');
    const dueDate = valid ? addMonths(lastVerifiedAt, months) : undefined;
    if (valid && dueDate > now) return [];
    return [
      {
        contentId,
        file,
        months,
        lastVerifiedAt: valid ? lastVerifiedAt : undefined,
        dueDate: dueDate?.toISOString().slice(0, 10),
      },
    ];
  });
}

export function reverificationIssue(due) {
  const last = due.lastVerifiedAt
    ? `last verified on ${due.lastVerifiedAt}`
    : 'with no valid last-verified date';
  return {
    title: `Reverify: ${due.contentId}`,
    labels: ['reverification'],
    body: [
      `The published record \`${due.contentId}\` (\`${due.file}\`) is due for reverification: ${last}, with a ${due.months}-month review interval.`,
      '',
      'Checklist:',
      '- [ ] Re-open each listed source and compare it with the page wording.',
      '- [ ] Update `lastVerifiedAt` only to the date you actually checked.',
      '- [ ] Update `governance/content-register.json` and `governance/revisions.json`.',
      '- [ ] If the source changed or disappeared, mark the record `outdated` or move it to `draft`.',
      '',
      'Opened automatically by the monthly reverification check. Do not add personal data to this issue.',
    ].join('\n'),
  };
}
