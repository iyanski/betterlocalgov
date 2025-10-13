/**
 * Admin API service for authenticated operations with the headless CMS backend
 */

import type {
  ApiResponse,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Tag,
  CreateTagDto,
  UpdateTagDto,
  Content,
  CreateContentDto,
  UpdateContentDto,
  ContentQuery,
  ContentType,
} from './types';

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Admin API Service Class
class AdminApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getCategories(authToken: string): Promise<Category[]> {
    return this.request<Category[]>('/categories', {}, authToken);
  }

  // Category management endpoints (authenticated)
  async createCategory(
    categoryData: CreateCategoryDto,
    authToken: string
  ): Promise<Category> {
    return this.request<Category>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify(categoryData),
      },
      authToken
    );
  }

  async updateCategory(
    id: string,
    categoryData: UpdateCategoryDto,
    authToken: string
  ): Promise<Category> {
    return this.request<Category>(
      `/categories/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(categoryData),
      },
      authToken
    );
  }

  async deleteCategory(id: string, authToken: string): Promise<void> {
    return this.request<void>(
      `/categories/${id}`,
      {
        method: 'DELETE',
      },
      authToken
    );
  }

  async getCategoryById(id: string, authToken: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {}, authToken);
  }

  // Tag management endpoints (authenticated)
  async getTags(authToken: string): Promise<Tag[]> {
    return this.request<Tag[]>('/tags', {}, authToken);
  }

  async createTag(tagData: CreateTagDto, authToken: string): Promise<Tag> {
    return this.request<Tag>(
      '/tags',
      {
        method: 'POST',
        body: JSON.stringify(tagData),
      },
      authToken
    );
  }

  async updateTag(
    id: string,
    tagData: UpdateTagDto,
    authToken: string
  ): Promise<Tag> {
    return this.request<Tag>(
      `/tags/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(tagData),
      },
      authToken
    );
  }

  async deleteTag(id: string, authToken: string): Promise<void> {
    return this.request<void>(
      `/tags/${id}`,
      {
        method: 'DELETE',
      },
      authToken
    );
  }

  async getTagById(id: string, authToken: string): Promise<Tag> {
    return this.request<Tag>(`/tags/${id}`, {}, authToken);
  }

  // Content management endpoints (authenticated)
  async createContent(
    contentData: CreateContentDto,
    authToken: string
  ): Promise<Content> {
    return this.request<Content>(
      '/content',
      {
        method: 'POST',
        body: JSON.stringify(contentData),
      },
      authToken
    );
  }

  async updateContent(
    id: string,
    contentData: UpdateContentDto,
    authToken: string
  ): Promise<Content> {
    return this.request<Content>(
      `/content/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(contentData),
      },
      authToken
    );
  }

  async deleteContent(
    id: string,
    authToken: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/content/${id}`,
      {
        method: 'DELETE',
      },
      authToken
    );
  }

  async publishContent(id: string, authToken: string): Promise<Content> {
    return this.request<Content>(
      `/content/${id}/publish`,
      {
        method: 'POST',
      },
      authToken
    );
  }

  // Admin content endpoints (authenticated)
  async getAdminContent(
    query: ContentQuery = {},
    authToken: string
  ): Promise<ApiResponse<Content[]>> {
    const params = new URLSearchParams(
      Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      )
    );

    const response = await this.request<{ data: ApiResponse<Content[]> }>(
      `/content?${params}`,
      {},
      authToken
    );
    return response.data;
  }

  async getAdminContentById(id: string, authToken: string): Promise<Content> {
    const response = await this.request<{ data: Content }>(
      `/content/${id}`,
      {},
      authToken
    );
    return response.data;
  }

  async getContentTypes(authToken: string): Promise<ContentType[]> {
    return this.request<ContentType[]>('/content-types', {}, authToken);
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService();

// Re-export types for convenience
export type {
  ApiResponse,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Tag,
  CreateTagDto,
  UpdateTagDto,
  Content,
  CreateContentDto,
  UpdateContentDto,
  ContentQuery,
  ContentType,
} from './types';
