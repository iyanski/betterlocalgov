import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getServiceCategories,
  getGovernmentActivities,
  getCategorySubcategories,
} from '../data/yamlLoader';
import { loadMarkdownContent } from '../lib/markdownLoader';
import { apiService } from '../services/api';
import {
  adminApiService,
  CreateContentDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateContentDto,
} from '../services/admin.api';
import {
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
} from '../services/types';

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
export function useApiCategories({
  isAdmin,
  authToken,
}: {
  isAdmin: boolean;
  authToken?: string;
}) {
  return useApiData(
    () =>
      isAdmin
        ? adminApiService.getCategories(authToken || '')
        : apiService.getCategories(),
    []
  );
}

// Hook for category CRUD operations
export function useCategoryCrud(authToken?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (categoryData: CreateCategoryDto) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.createCategory(
        categoryData,
        authToken
      );
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
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.updateCategory(
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
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      await adminApiService.deleteCategory(id, authToken);
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

// Hook for API tags
export function useApiTags({
  isAdmin,
  authToken,
}: {
  isAdmin: boolean;
  authToken?: string;
}) {
  return useApiData(
    () =>
      isAdmin ? adminApiService.getTags(authToken || '') : apiService.getTags(),
    []
  );
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

// Hook for API content types
export function useApiContentTypes({
  isAdmin,
  authToken,
}: {
  isAdmin: boolean;
  authToken?: string;
}) {
  return useApiData(
    () =>
      isAdmin
        ? adminApiService.getContentTypes(authToken || '')
        : apiService.getContentTypes(),
    []
  );
}

export function useContentCrud(authToken?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContent = async (id: string) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getContentById(id);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get content';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: CreateContentDto) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.createContent(
        contentData,
        authToken
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create content';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (id: string, contentData: UpdateContentDto) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.updateContent(
        id,
        contentData,
        authToken
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update content';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      await adminApiService.deleteContent(id, authToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getContent,
    createContent,
    updateContent,
    deleteContent,
    loading,
    error,
  };
}

export function useDocumentTypeCrud(authToken?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDocumentType = async (
    documentTypeData: CreateDocumentTypeDto
  ) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.createDocumentType(
        documentTypeData,
        authToken
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create document type';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentType = async (
    id: string,
    documentTypeData: UpdateDocumentTypeDto
  ) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.updateDocumentType(
        id,
        documentTypeData,
        authToken
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create document type';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentType = async (id: string) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      const result = await adminApiService.getDocumentTypeById(id, authToken);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get document type';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocumentType = async (id: string) => {
    if (!authToken) {
      throw new Error('Authentication token is required');
    }
    try {
      setLoading(true);
      setError(null);
      await adminApiService.deleteDocumentType(id, authToken);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete document type';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return {
    createDocumentType,
    updateDocumentType,
    getDocumentType,
    deleteDocumentType,
    loading,
    error,
  };
}
