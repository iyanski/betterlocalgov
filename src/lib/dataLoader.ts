/**
 * Utility to load JSON data for statistics and transparency pages
 */

export interface StatisticsData {
  highlightStats: HighlightStat[];
  populationTrend?: PopulationPoint[];
  growthIntervals?: GrowthInterval[];
  cmciPillars?: PillarScore[];
  overallRank?: string;
  overallScore?: number;
  municipalityClass?: string;
  cmciPopulationBasis?: number;
  cmciProfile?: CmciProfile;
  sourceLinks?: SourceLink[];
}

export interface TransparencyData {
  highlightStats: HighlightStat[];
  revenueSources?: RevenueSource[];
  localRevenueBreakdown?: RevenueLine[];
  taxRevenueLines?: RevenueLine[];
  nonTaxRevenueLines?: RevenueLine[];
  q1IncomeSources?: RevenueSource[];
  q1ExpenditureSources?: RevenueSource[];
  q1FundPosition?: RevenueLine[];
  q1LocalSourceBreakdown?: RevenueLine[];
  q1SocialServicesBreakdown?: RevenueLine[];
  ldrrmfSources?: DisasterFund[];
  sourceLinks?: SourceLink[];
}

export interface ProcurementData {
  content?: ProcurementContent;
  asOf: string;
  sourceLinks?: SourceLink[];
  summary: ProcurementSummary;
  categories: string[];
  records: ProcurementRecord[];
}

export interface ProcurementContent {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  sourceNote: string;
  dateLabel: string;
}

export interface ProcurementSummary {
  recordCount: number;
  totalBudget: number;
  largestBudget: number;
  earliestDate: string | null;
  latestDate: string | null;
  categoryCount: number;
}

export interface ProcurementRecord {
  id: string;
  referenceId: string;
  contractNo: string;
  title: string;
  noticeTitle: string;
  awardee: string;
  procuringEntity: string;
  budget: number;
  awardDate: string | null;
  status?: string;
  category: string;
  classification: string;
  areaOfDelivery: string;
  year?: string;
  progress?: number;
  completionDate?: string | null;
  amountPaid?: number;
}

export interface HighlightStat {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: string;
}

export interface PopulationPoint {
  year: string;
  label: string;
  population: number;
}

export interface GrowthInterval {
  label: string;
  value: number;
  detail: string;
  tone: string;
}

export interface PillarScore {
  pillar: string;
  rank: string;
  score: number;
  tone?: string;
  description?: string;
}

export interface CmciProfile {
  rank: number;
  lgu: string;
  province?: string;
  region?: string;
  ranking2024?: number;
  ranking2023: number;
  improvement: number;
}

export interface SourceLink {
  label: string;
  href: string;
}

export interface RevenueSource {
  label: string;
  value: number;
  percent: number;
  tone: string;
  color: string;
}

export interface RevenueLine {
  label: string;
  value: number;
  detail: string;
  tone?: string;
}

export interface DisasterFund {
  label: string;
  appropriation: number;
  expenditure: number;
  utilization: number;
  tone: string;
}

/**
 * Load demographics data from JSON file
 */
export async function loadDemographicsData(): Promise<StatisticsData> {
  try {
    const module =
      await import('../../content/statistics/demographics/demographics.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load demographics data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load competitiveness data from JSON file
 */
export async function loadCompetitivenessData(): Promise<StatisticsData> {
  try {
    const module =
      await import('../../content/statistics/competitiveness/competitiveness.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load competitiveness data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load income and dependency data from JSON file
 */
export async function loadIncomeDependencyData(): Promise<TransparencyData> {
  try {
    const module =
      await import('../../content/transparency/annual-regular-income-and-dependencies/annual-regular-income-and-dependencies.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load income dependency data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load statement of receipts and expenditure data from JSON file
 */
export async function loadStatementReceiptsExpenditureData(): Promise<TransparencyData> {
  try {
    const module =
      await import('../../content/transparency/statements-of-receipts-and-expenditure/statements-of-receipts-and-expenditure.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load statement receipts expenditure data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load disaster risk reduction and management data from JSON file
 */
export async function loadDisasterRiskReductionData(): Promise<TransparencyData> {
  try {
    const module =
      await import('../../content/transparency/disaster-risk-reduction-and-management/disaster-risk-reduction-and-management.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load disaster risk reduction data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load procurement data from JSON file
 */
export async function loadProcurementData(): Promise<ProcurementData | null> {
  try {
    const module =
      await import('../../content/transparency/procurement/procurement.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load procurement data:', error);
    return null;
  }
}

/**
 * Load DPWH projects data from JSON file
 */
export async function loadDpwhProjectsData(): Promise<ProcurementData | null> {
  try {
    const module =
      await import('../../content/transparency/dpwh-projects/dpwh-projects.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load DPWH projects data:', error);
    return null;
  }
}
