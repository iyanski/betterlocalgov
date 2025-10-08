import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getServiceCategories,
  getGovernmentActivities,
  getCategorySubcategories,
} from '../data/yamlLoader';
import { loadMarkdownContent } from '../lib/markdownLoader';
import {
  apiService,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../services/api';

// Generic hook for API data loading with loading states and error handling
export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchFunctionRef = useRef(fetchFunction);
  const dependencyString = JSON.stringify(dependencies);

  // Update the ref when dependencies change
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction, dependencyString]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunctionRef.current();
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, dependencyString]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Specific hook for service categories
export function useServiceCategories() {
  return useApiData(getServiceCategories);
}

// Specific hook for government activities
export function useGovernmentActivities() {
  return useApiData(getGovernmentActivities);
}

// Specific hook for category subcategories
export function useCategorySubcategories(categorySlug: string) {
  return useApiData(
    () => getCategorySubcategories(categorySlug),
    [categorySlug]
  );
}

// Specific hook for markdown content
export function useMarkdownContent(documentSlug: string) {
  return useApiData(() => loadMarkdownContent(documentSlug), [documentSlug]);
}

// Hook for API categories (direct from API)
export function useApiCategories() {
  return useApiData(() => apiService.getCategories(), []);
}

// Hook for category CRUD operations
export function useCategoryCrud(authToken?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (categoryData: CreateCategoryDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.createCategory(categoryData, authToken);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: UpdateCategoryDto
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.updateCategory(
        id,
        categoryData,
        authToken
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteCategory(id, authToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
    error,
  };
}

// Hook for API content by category
export function useApiContentByCategory(
  categorySlug: string,
  query: Record<string, unknown> = {}
) {
  return useApiData(
    () => apiService.getContentByCategory(categorySlug, query),
    [categorySlug, JSON.stringify(query)]
  );
}

// Hook for API content by slug
export function useApiContentBySlug(slug: string) {
  return useApiData(() => apiService.getContentBySlug(slug), [slug]);
}
