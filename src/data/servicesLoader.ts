import yaml from 'js-yaml';

// Type definitions for the services data
export interface Subcategory {
  name: string;
  slug: string;
}

export interface Category {
  category: string;
  slug: string;
  subcategories: Subcategory[];
}

export interface ServicesData {
  categories: Category[];
}

// Import the YAML file as raw text
import yamlContent from './services.yaml?raw';

// Parse the YAML content
export const serviceCategories: ServicesData = yaml.load(
  yamlContent
) as ServicesData;
