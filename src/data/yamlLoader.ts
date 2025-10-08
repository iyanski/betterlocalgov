import yaml from 'js-yaml';
import { apiService, Category as ApiCategory } from '../services/api';

// Type definitions for the services data (keeping for backward compatibility)
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

// Fallback: Import the YAML file as raw text for development/fallback
import servicesYamlContent from './services.yaml?raw';
import governmentActivitiesYamlContent from './government.yaml?raw';

// Cache for API data
// const apiCategoriesCache: ApiCategory[] | null = null;
let serviceCategoriesCache: CategoryData | null = null;
let governmentActivitiesCache: CategoryData | null = null;

// Parse the YAML content (fallback)
const fallbackServiceCategories: CategoryData = yaml.load(
  servicesYamlContent
) as CategoryData;

const fallbackGovernmentActivities: CategoryData = yaml.load(
  governmentActivitiesYamlContent
) as CategoryData;

// Function to convert API categories to legacy format
function convertApiCategoriesToLegacy(
  apiCategories: ApiCategory[]
): CategoryData {
  // Map API categories to legacy format
  const categories: Category[] = apiCategories.map(apiCat => ({
    category: apiCat.name,
    slug: apiCat.slug,
    description: apiCat.description || '',
    icon: '📋', // Default icon, could be enhanced with API data
  }));

  return {
    categories,
    description: 'Services provided by the local government',
  };
}

// Function to get service categories (API-first with fallback)
export async function getServiceCategories(): Promise<CategoryData> {
  if (serviceCategoriesCache) {
    return serviceCategoriesCache;
  }

  try {
    const apiCategories = await apiService.getCategories();
    serviceCategoriesCache = convertApiCategoriesToLegacy(apiCategories);
    return serviceCategoriesCache;
  } catch (error) {
    console.warn('Failed to load categories from API, using fallback:', error);
    return fallbackServiceCategories;
  }
}

// Function to get government activities (API-first with fallback)
export async function getGovernmentActivities(): Promise<CategoryData> {
  if (governmentActivitiesCache) {
    return governmentActivitiesCache;
  }

  try {
    // For now, use the same categories as services
    // This could be enhanced to use a different content type or filter
    const apiCategories = await apiService.getCategories();
    governmentActivitiesCache = convertApiCategoriesToLegacy(apiCategories);
    return governmentActivitiesCache;
  } catch (error) {
    console.warn(
      'Failed to load government activities from API, using fallback:',
      error
    );
    return fallbackGovernmentActivities;
  }
}

// Legacy exports for backward compatibility (now async)
export const serviceCategories = fallbackServiceCategories;
export const governmentActivitCategories = fallbackGovernmentActivities;

// Function to load category index data (API-first with fallback)
export async function loadCategoryIndex(
  categorySlug: string
): Promise<Subcategory[]> {
  try {
    // Try to get content from API first
    try {
      const contentResponse = await apiService.getContentByCategory(
        categorySlug,
        { limit: 100 }
      );
      const subcategories: Subcategory[] = contentResponse.data.map(
        content => ({
          name: content.title,
          slug: content.slug,
          description:
            content.content.excerpt || content.content.description || '',
        })
      );
      return subcategories;
    } catch (apiError) {
      console.warn(
        `Failed to load category ${categorySlug} from API, trying fallback:`,
        apiError
      );

      // Fallback to static YAML files
      const category = fallbackServiceCategories.categories.find(
        c => c.slug === categorySlug
      );
      if (!category) {
        console.warn(`Category ${categorySlug} not found in fallback data`);
        return [];
      }

      // For fallback, return empty array since we don't have the static YAML imports anymore
      // This could be enhanced to load from static files if needed
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
