import * as yaml from 'js-yaml';

// Type definitions for the services data
export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
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
// NOTE: every category needs BOTH an import here and an entry in
// categoryIndexMap below. A missing entry renders an empty category page
// silently — it is not a build error.
import grassrootsSportsIndex from '../../content/services/grassroots-sports/index.yaml?raw';
import nationalAthletesIndex from '../../content/services/national-athletes/index.yaml?raw';
import sportsFacilitiesIndex from '../../content/services/sports-facilities/index.yaml?raw';
import sportsDevelopmentIndex from '../../content/services/sports-development/index.yaml?raw';
import awardsAndRecognitionIndex from '../../content/services/awards-and-recognition/index.yaml?raw';
import inclusiveSportsIndex from '../../content/services/inclusive-sports/index.yaml?raw';
import partnershipsAndAssistanceIndex from '../../content/services/partnerships-and-assistance/index.yaml?raw';
import aboutPscIndex from '../../content/government/about-psc/index.yaml?raw';
import leadershipIndex from '../../content/government/leadership/index.yaml?raw';
import transparencyIndex from '../../content/government/transparency/index.yaml?raw';
import procurementIndex from '../../content/government/procurement/index.yaml?raw';
import careersIndex from '../../content/government/careers/index.yaml?raw';

// Create a mapping of category slugs to their YAML content.
// This is a single flat namespace shared by services and government, and
// every key here also becomes a reserved document slug (see isNestedCategory).
const categoryIndexMap: { [key: string]: string } = {
  'grassroots-sports': grassrootsSportsIndex,
  'national-athletes': nationalAthletesIndex,
  'sports-facilities': sportsFacilitiesIndex,
  'sports-development': sportsDevelopmentIndex,
  'awards-and-recognition': awardsAndRecognitionIndex,
  'inclusive-sports': inclusiveSportsIndex,
  'partnerships-and-assistance': partnershipsAndAssistanceIndex,
  'about-psc': aboutPscIndex,
  leadership: leadershipIndex,
  transparency: transparencyIndex,
  procurement: procurementIndex,
  careers: careersIndex,
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
