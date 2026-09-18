/**
 * Every published budget year must satisfy the FAR No. 1 form's own identities,
 * exactly, to the centavo.
 *
 * This is the gate between "a machine read a scan" and "we put a number on a
 * public accountability site". A figure that does not balance is not published,
 * so this test failing means something in src/data/psc/budget.ts was edited
 * without being re-checked against the page image.
 *
 * Usage:  node scripts/psc-data/budget.test.mjs
 */
// does not balance to the centavo must not ship.
import {
  budgetYears,
  obligationRate,
  disbursementRate,
} from '../../src/data/psc/budget.ts';

const eq = (a, b) => Math.abs(a - b) < 0.005;
let bad = 0;
console.log(
  'FY    approp          adj-approp      allotments      obligations     disbursed       oblig%  disb%  checks'
);
for (const y of budgetYears) {
  const c1 = eq(y.adjustedAppropriations, y.appropriations + y.adjustments);
  const c2 = eq(
    y.unreleasedAppropriations,
    y.adjustedAppropriations - y.adjustedAllotments
  );
  const c3 = eq(y.unobligatedAllotments, y.adjustedAllotments - y.obligations);
  const c4 = eq(y.unpaidObligations, y.obligations - y.disbursements);
  const ok = c1 && c2 && c3 && c4;
  if (!ok) bad++;
  const n = v =>
    v.toLocaleString('en-US', { maximumFractionDigits: 0 }).padStart(15);
  console.log(
    `${y.fiscalYear}${y.through === 'Q2' ? '*' : ' '}${n(y.appropriations)}${n(y.adjustedAppropriations)}` +
      `${n(y.adjustedAllotments)}${n(y.obligations)}${n(y.disbursements)}` +
      `${obligationRate(y).toFixed(1).padStart(8)}%${disbursementRate(y).toFixed(1).padStart(6)}%  ` +
      `${ok ? 'all pass' : [c1 ? '' : 'adj', c2 ? '' : 'unreleased', c3 ? '' : 'unobligated', c4 ? '' : 'unpaid'].filter(Boolean).join(',') + ' FAIL'}`
  );
}
console.log(
  `\n${budgetYears.length} years, ${bad} failing. * = half year (Q2).`
);
process.exit(bad ? 1 : 0);
