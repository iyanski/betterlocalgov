import yaml from 'js-yaml';

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
  pages: Subcategory[];
}

// Import the YAML file as raw text
import servicesYamlContent from './services.yaml?raw';
import governmentActivitiesYamlContent from './government.yaml?raw';

// Import all category index files statically
import healthServicesIndex from '../../content/services/health-services/index.yaml?raw';
import educationIndex from '../../content/services/education/index.yaml?raw';
import businessIndex from '../../content/services/business/index.yaml?raw';
import socialWelfareIndex from '../../content/services/social-welfare/index.yaml?raw';
import agricultureFisheriesIndex from '../../content/services/agriculture-fisheries/index.yaml?raw';
import infrastructurePublicWorksIndex from '../../content/services/infrastructure-public-works/index.yaml?raw';
import garbageWasteDisposalIndex from '../../content/services/garbage-waste-disposal/index.yaml?raw';
import environmentIndex from '../../content/services/environment/index.yaml?raw';
import disasterPreparednessIndex from '../../content/services/disaster-preparedness/index.yaml?raw';
import housingLandUseIndex from '../../content/services/housing-land-use/index.yaml?raw';

// Create a mapping of category slugs to their YAML content
const categoryIndexMap: { [key: string]: string } = {
  'health-services': healthServicesIndex,
  education: educationIndex,
  business: businessIndex,
  'social-welfare': socialWelfareIndex,
  'agriculture-fisheries': agricultureFisheriesIndex,
  'infrastructure-public-works': infrastructurePublicWorksIndex,
  'garbage-waste-disposal': garbageWasteDisposalIndex,
  environment: environmentIndex,
  'disaster-preparedness': disasterPreparednessIndex,
  'housing-land-use': housingLandUseIndex,
};

// Parse the YAML content
export const serviceCategories: CategoryData = yaml.load(
  servicesYamlContent
) as CategoryData;

export const governmentActivitCategories: CategoryData = yaml.load(
  governmentActivitiesYamlContent
) as CategoryData;

// Function to load category index data
export async function loadCategoryIndex(
  categorySlug: string
): Promise<Subcategory[]> {
  try {
    // Find the category to verify it exists
    const category = serviceCategories.categories.find(
      c => c.slug === categorySlug
    );
    if (!category) {
      console.warn(`Category ${categorySlug} not found`);
      return [];
    }

    // Use the statically imported YAML content from the mapping
    try {
      const yamlContent = categoryIndexMap[categorySlug];

      if (!yamlContent) {
        console.warn(`Category ${categorySlug} not found in categoryIndexMap`);
        return [];
      }

      const indexData: CategoryIndexData = yaml.load(
        yamlContent
      ) as CategoryIndexData;
      return indexData.pages || [];
    } catch (parseError) {
      console.warn(
        `Failed to parse YAML content for category ${categorySlug}:`,
        parseError
      );
      return [];
    }
  } catch (error) {
    console.error(`Error loading category index for ${categorySlug}:`, error);
    return [];
  }
}

// Function to get subcategories for a category (with caching)
const categoryCache = new Map<string, Subcategory[]>();

export async function getCategorySubcategories(
  categorySlug: string
): Promise<Subcategory[]> {
  if (categoryCache.has(categorySlug)) {
    return categoryCache.get(categorySlug)!;
  }

  const subcategories = await loadCategoryIndex(categorySlug);
  categoryCache.set(categorySlug, subcategories);
  return subcategories;
}
