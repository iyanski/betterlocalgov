/**
 * Philippine Sports Commission — agency-specific budget, FY2017–FY2026.
 *
 * Source: the PSC's own FAR No. 1 (Statement of Appropriations, Allotments,
 * Obligations, Disbursements and Balances), filed quarterly and published on
 * its Transparency Seal page. Each year here is the 4th-quarter filing, which
 * is cumulative for the year; FY2026 is the 2nd-quarter filing and covers only
 * half a year.
 *
 * WHY IT STARTS AT 2017. Not an editorial choice. The PSC's own links for
 * FY2013–FY2016 all point at `www.web.psc.gov.ph`, a host the agency retired,
 * and none of them resolve. The record simply stops.
 *
 * SCOPE. "Agency-specific budget" — the row the form labels `I. Agency Specific
 * Budget`. It excludes automatic appropriations (retirement and life insurance
 * premiums), continuing appropriations carried over from prior years, and
 * special purpose funds, each of which the form reports as its own statement.
 *
 * HOW THESE WERE READ. Machine-read from 300 dpi renders of the scans, then
 * read again from the page image and reconciled. Every row satisfies all three
 * of the form's own identities exactly, to the centavo:
 *
 *   unreleasedAppropriations = adjustedAppropriations − adjustedAllotments
 *   unobligatedAllotments    = adjustedAllotments − obligations
 *   unpaidObligations        = obligations − disbursements
 *
 * A figure that did not balance is not published. That is the whole test.
 */

export interface BudgetYear {
  fiscalYear: number;
  /** Quarter the filing covers. FY2026 is a half-year and not comparable. */
  through: 'Q2' | 'Q4';
  /** What Congress appropriated (GAA). */
  appropriations: number;
  /** Mid-year modifications. Negative means money was taken away. */
  adjustments: number;
  adjustedAppropriations: number;
  /** What DBM actually released to the agency to spend. */
  adjustedAllotments: number;
  /** What the agency committed by entering obligations. */
  obligations: number;
  /** What actually left the account. */
  disbursements: number;
  unreleasedAppropriations: number;
  unobligatedAllotments: number;
  unpaidObligations: number;
  /**
   * 'read' — taken from a row the form prints as a single agency total.
   * 'summed' — FY2017 and FY2018 use an older layout in which the agency
   * total row is blank, so these are General Administration and Support plus
   * Operations, the two components that make it up.
   */
  basis: 'read' | 'summed';
  docId: string;
}

export const budgetYears: BudgetYear[] = [
  {
    fiscalYear: 2017,
    through: 'Q4',
    appropriations: 189_124_000,
    adjustments: 0,
    adjustedAppropriations: 189_124_000,
    adjustedAllotments: 189_073_685,
    obligations: 165_242_308.77,
    disbursements: 155_728_365.04,
    unreleasedAppropriations: 50_315,
    unobligatedAllotments: 23_831_376.23,
    unpaidObligations: 9_513_943.73,
    basis: 'summed',
    docId: 'far1-2017-q4',
  },
  {
    fiscalYear: 2018,
    through: 'Q4',
    appropriations: 164_039_000,
    adjustments: 0,
    adjustedAppropriations: 164_039_000,
    adjustedAllotments: 163_057_103,
    obligations: 161_549_309.23,
    disbursements: 160_284_617.03,
    unreleasedAppropriations: 981_897,
    unobligatedAllotments: 1_507_793.77,
    unpaidObligations: 1_264_692.2,
    basis: 'summed',
    docId: 'far1-2018-q4',
  },
  {
    // The SEA Games year. The form spells it out in the particulars column:
    // "P5,000,000,000.00 for the Hosting of 2019 SEA Games".
    fiscalYear: 2019,
    through: 'Q4',
    appropriations: 5_357_315_000,
    adjustments: 0,
    adjustedAppropriations: 5_357_315_000,
    adjustedAllotments: 5_322_188_430,
    obligations: 5_314_274_386.93,
    disbursements: 5_174_447_755.34,
    unreleasedAppropriations: 35_126_570,
    unobligatedAllotments: 7_914_043.07,
    unpaidObligations: 139_826_631.59,
    basis: 'read',
    docId: 'far1-2019-q4',
  },
  {
    // The pandemic year, and the sharpest single fact in the series: more than
    // half the appropriation was withdrawn mid-year, and most of what survived
    // was never released.
    fiscalYear: 2020,
    through: 'Q4',
    appropriations: 944_964_000,
    adjustments: -551_605_000,
    adjustedAppropriations: 393_359_000,
    adjustedAllotments: 143_359_000,
    obligations: 135_012_854.6,
    disbursements: 129_716_417.55,
    unreleasedAppropriations: 250_000_000,
    unobligatedAllotments: 8_346_145.4,
    unpaidObligations: 5_296_437.05,
    basis: 'read',
    docId: 'far1-2020-q4',
  },
  {
    fiscalYear: 2021,
    through: 'Q4',
    appropriations: 1_303_592_000,
    adjustments: 0,
    adjustedAppropriations: 1_303_592_000,
    adjustedAllotments: 1_278_592_000,
    obligations: 743_749_532.6,
    disbursements: 719_953_103.88,
    unreleasedAppropriations: 25_000_000,
    unobligatedAllotments: 534_842_467.4,
    unpaidObligations: 23_796_428.72,
    basis: 'read',
    docId: 'far1-2021-q4',
  },
  {
    fiscalYear: 2022,
    through: 'Q4',
    appropriations: 725_238_000,
    adjustments: 0,
    adjustedAppropriations: 725_238_000,
    adjustedAllotments: 705_238_000,
    obligations: 389_899_520.18,
    disbursements: 347_139_174.07,
    unreleasedAppropriations: 20_000_000,
    unobligatedAllotments: 315_338_479.82,
    unpaidObligations: 42_760_346.11,
    basis: 'read',
    docId: 'far1-2022-q4',
  },
  {
    fiscalYear: 2023,
    through: 'Q4',
    appropriations: 2_276_700_000,
    adjustments: 0,
    adjustedAppropriations: 2_276_700_000,
    adjustedAllotments: 2_226_700_000,
    obligations: 1_748_260_144.99,
    disbursements: 1_712_277_022.25,
    unreleasedAppropriations: 50_000_000,
    unobligatedAllotments: 478_439_855.01,
    unpaidObligations: 35_983_122.74,
    basis: 'read',
    docId: 'far1-2023-q4',
  },
  {
    fiscalYear: 2024,
    through: 'Q4',
    appropriations: 1_156_452_000,
    adjustments: 0,
    adjustedAppropriations: 1_156_452_000,
    adjustedAllotments: 1_156_452_000,
    obligations: 685_771_729.2,
    disbursements: 602_620_104,
    unreleasedAppropriations: 0,
    unobligatedAllotments: 470_680_270.8,
    unpaidObligations: 83_151_625.2,
    basis: 'read',
    docId: 'far1-2024-q4',
  },
  {
    fiscalYear: 2025,
    through: 'Q4',
    appropriations: 1_275_155_000,
    adjustments: 0,
    adjustedAppropriations: 1_275_155_000,
    adjustedAllotments: 1_130_155_000,
    obligations: 841_404_623.82,
    disbursements: 771_938_979.89,
    unreleasedAppropriations: 145_000_000,
    unobligatedAllotments: 288_750_376.18,
    unpaidObligations: 69_465_643.93,
    basis: 'read',
    docId: 'far1-2025-q4',
  },
  {
    // Half a year only. Shown on charts but never compared to a full year.
    fiscalYear: 2026,
    through: 'Q2',
    appropriations: 2_206_808_000,
    adjustments: 0,
    adjustedAppropriations: 2_206_808_000,
    adjustedAllotments: 1_496_808_000,
    obligations: 557_285_285.29,
    disbursements: 543_443_657.98,
    unreleasedAppropriations: 710_000_000,
    unobligatedAllotments: 939_522_714.71,
    unpaidObligations: 13_841_627.31,
    basis: 'read',
    docId: 'far1-2026-q2',
  },
];

/** Full fiscal years only — FY2026 covers half a year and would mislead a trend. */
export const fullYears = budgetYears.filter(y => y.through === 'Q4');

/** Share of the adjusted appropriation the agency managed to commit. */
export const obligationRate = (y: BudgetYear) =>
  (y.obligations / y.adjustedAppropriations) * 100;

/** Share of the adjusted appropriation that actually left the account. */
export const disbursementRate = (y: BudgetYear) =>
  (y.disbursements / y.adjustedAppropriations) * 100;

export const byYear = (fy: number) =>
  budgetYears.find(y => y.fiscalYear === fy);

export const source = {
  form: 'FAR No. 1 — Statement of Appropriations, Allotments, Obligations, Disbursements and Balances',
  publisher: 'Philippine Sports Commission',
  page: 'Transparency Seal',
  url: 'https://psc.gov.ph/psc_site/transparency-seal/',
  firstYear: 2017,
  lastYear: 2026,
  /** FY2013–FY2016 exist in the index but not on any server. */
  missingYears: [2013, 2014, 2015, 2016],
};
