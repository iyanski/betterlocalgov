import yaml from 'js-yaml';

// Type definitions for the services data
export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
  group?: string;
}

export interface Category {
  category: string;
  slug: string;
  description: string;
  icon: string;
  subcategories?: Subcategory[]; // Keep for backward compatibility
}

export interface CategoryData {
  categories: Category[];
  description: string;
}

export interface CategoryIndexData {
  title?: string;
  description?: string;
  layout?: 'grid' | 'list';
  pages: Subcategory[];
}

// Import the YAML file as raw text
import servicesYamlContent from './services.yaml?raw';
import governmentActivitiesYamlContent from './government.yaml?raw';

// Import all category index files statically
import healthServicesIndex from '../../content/services/health-services/index.yaml?raw';
import civilRegistryIndex from '../../content/services/civil-registry/index.yaml?raw';
import taxesPaymentsIndex from '../../content/services/taxes-payments/index.yaml?raw';
import businessIndex from '../../content/services/business/index.yaml?raw';
import socialWelfareIndex from '../../content/services/social-welfare/index.yaml?raw';
import agricultureFisheriesIndex from '../../content/services/agriculture-fisheries/index.yaml?raw';
import engineeringZoningIndex from '../../content/services/engineering-zoning/index.yaml?raw';
import disasterEmergencyIndex from '../../content/services/disaster-emergency/index.yaml?raw';
import educationLivelihoodIndex from '../../content/services/education-livelihood/index.yaml?raw';
import complaintsRequestsIndex from '../../content/services/complaints-requests/index.yaml?raw';
import educationIndex from '../../content/services/education/index.yaml?raw';
import garbageWasteDisposalIndex from '../../content/services/garbage-waste-disposal/index.yaml?raw';
import governmentBarangaysIndex from '../../content/government/barangays/index.yaml?raw';
import governmentLeadershipLegislativeIndex from '../../content/government/leadership/legislative/index.yaml?raw';
import transparencyIndex from '../../content/transparency/index.yaml?raw';
import transparencyAnnualRegularIncomeIndex from '../../content/transparency/annual-regular-income-and-dependencies/index.yaml?raw';
import transparencyStatementsReceiptsExpenditureIndex from '../../content/transparency/statements-of-receipts-and-expenditure/index.yaml?raw';
import transparencyDisasterRiskReductionIndex from '../../content/transparency/disaster-risk-reduction-and-management/index.yaml?raw';
import transparencyProcurementIndex from '../../content/transparency/procurement/index.yaml?raw';
import transparencyDpwhProjectsIndex from '../../content/transparency/dpwh-projects/index.yaml?raw';
import transparencySpecialEducationFundIndex from '../../content/transparency/special-education-fund/index.yaml?raw';
import statisticsIndex from '../../content/statistics/index.yaml?raw';
import statisticsDemographicsIndex from '../../content/statistics/demographics/index.yaml?raw';
import statisticsCompetitivenessIndex from '../../content/statistics/competitiveness/index.yaml?raw';

// Create a mapping of category slugs to their YAML content
const categoryIndexMap: { [key: string]: string } = {
  'civil-registry': civilRegistryIndex,
  'health-services': healthServicesIndex,
  business: businessIndex,
  'taxes-payments': taxesPaymentsIndex,
  'social-welfare': socialWelfareIndex,
  'agriculture-fisheries': agricultureFisheriesIndex,
  'engineering-zoning': engineeringZoningIndex,
  'disaster-emergency': disasterEmergencyIndex,
  'education-livelihood': educationLivelihoodIndex,
  'complaints-requests': complaintsRequestsIndex,
  education: educationIndex,
  'garbage-waste-disposal': garbageWasteDisposalIndex,
  barangays: governmentBarangaysIndex,
  legislative: governmentLeadershipLegislativeIndex,
  transparency: transparencyIndex,
  'annual-regular-income-and-dependencies':
    transparencyAnnualRegularIncomeIndex,
  'statements-of-receipts-and-expenditure':
    transparencyStatementsReceiptsExpenditureIndex,
  'disaster-risk-reduction-and-management':
    transparencyDisasterRiskReductionIndex,
  procurement: transparencyProcurementIndex,
  'dpwh-projects': transparencyDpwhProjectsIndex,
  'special-education-fund': transparencySpecialEducationFundIndex,
  statistics: statisticsIndex,
  demographics: statisticsDemographicsIndex,
  competitiveness: statisticsCompetitivenessIndex,
};

// Parse the YAML content
export const serviceCategories: CategoryData = yaml.load(
  servicesYamlContent
) as CategoryData;

export const governmentCategories: CategoryData = yaml.load(
  governmentActivitiesYamlContent
) as CategoryData;

export interface CategoryIndex {
  title?: string;
  description?: string;
  layout: 'grid' | 'list';
  pages: Subcategory[];
}

// Function to load category index data
export async function loadCategoryIndex(
  categorySlug: string
): Promise<CategoryIndex> {
  const yamlContent = categoryIndexMap[categorySlug];
  if (!yamlContent) {
    return { layout: 'list', pages: [] };
  }
  try {
    const indexData: CategoryIndexData = yaml.load(
      yamlContent
    ) as CategoryIndexData;
    return {
      title: indexData.title,
      description: indexData.description,
      layout: indexData.layout ?? 'list',
      pages: indexData.pages || [],
    };
  } catch (parseError) {
    console.warn(
      `Failed to parse YAML content for category ${categorySlug}:`,
      parseError
    );
    return { layout: 'list', pages: [] };
  }
}

// Function to get subcategories for a category (with caching)
const categoryCache = new Map<string, CategoryIndex>();

export async function getCategorySubcategories(
  categorySlug: string
): Promise<CategoryIndex> {
  if (categoryCache.has(categorySlug)) {
    return categoryCache.get(categorySlug)!;
  }

  const result = await loadCategoryIndex(categorySlug);
  categoryCache.set(categorySlug, result);
  return result;
}

/** Returns true if a slug has a registered index in categoryIndexMap */
export function isNestedCategory(slug: string): boolean {
  return slug in categoryIndexMap;
}
