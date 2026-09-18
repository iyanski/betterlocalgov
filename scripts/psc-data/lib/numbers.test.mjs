/**
 * Tests for lib/numbers.mjs.
 *
 * The cases below are not hypothetical: the separator and letter-for-digit
 * errors are ones Vision actually made reading FAR No. 1 for FY2024.
 *
 * Usage:  node scripts/psc-data/lib/numbers.test.mjs
 */
import {
  parseMoney,
  repairCandidates,
  hasValidGrouping,
  strictSum,
  MONEY_RE,
} from './numbers.mjs';

let pass = 0,
  fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok)
    console.log(
      `  FAIL ${name}\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`
    );
};

// Blank is not zero -- the single most important rule in this file.
t('blank -> null', parseMoney('').value, null);
t('dash -> null', parseMoney('-').value, null);
t('printed zero -> 0', parseMoney('0.00').value, 0);
t('blank is ok', parseMoney('').ok, true);

t('plain', parseMoney('1,156,452,000.00').value, 1156452000);
t('accounting neg', parseMoney('(2,071,059,513.84)').value, -2071059513.84);
t('minus neg', parseMoney('-1,234.50').value, -1234.5);
t('no grouping', parseMoney('1234.56').value, 1234.56);

// Not number-shaped: flagged, never coerced.
t('letters rejected', parseMoney('1,23O,000.00').ok, false);
t('no decimals rejected', parseMoney('1,234').ok, false);
t('counts allowed', parseMoney('17,660', { allowCount: true }).value, 17660);

t('grouping good', hasValidGrouping('1,234,567.00'), true);
t('grouping bad', hasValidGrouping('1,23,4567.00'), false);

// The real error this page produced: a comma read as a period.
const r1 = repairCandidates('21.041,186.56');
t('separator repair', r1[0] && r1[0].text, '21,041,186.56');
t('separair value', r1[0] && r1[0].value, 21041186.56);
t('repair recorded', r1[0] && r1[0].repairs, ['.->,']);

// Letter-for-digit, the other common one.
const r2 = repairCandidates('1,23O,000.00');
t('O->0 repair', r2[0] && r2[0].text, '1,230,000.00');
t('l->1 repair', repairCandidates('l02,968,000.00')[0]?.text, '102,968,000.00');

// A digit-for-digit misread (44,268 vs 44,269) is deliberately NOT repairable:
// the search space is unconstrained and a plausible-looking "fix" would be a
// fabricated figure. Those go to blind AI re-read instead.
t(
  'digit swap not attempted',
  repairCandidates('44,268,000.00').map(c => c.text),
  ['44,268,000.00']
);

// A missing addend poisons the total rather than being treated as zero.
t('strictSum ok', strictSum([1.5, 2.25]), 3.75);
t('strictSum null', strictSum([1.5, null]), null);
t('strictSum centavos', strictSum([0.1, 0.2]), 0.3);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
