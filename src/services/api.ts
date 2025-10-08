/**
 * API service for communicating with the headless CMS backend
 */

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const ORGANIZATION_SLUG =
  import.meta.env.VITE_ORGANIZATION_SLUG || 'betterlocalgov';

// Types matching the API response structure
export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  _count?: {
    content: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ContentMedia {
  media: Media;
  fieldName: string;
  order: number;
}

export interface ContentCategory {
  category: Category;
}

export interface ContentTag {
  tag: Tag;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>; // Dynamic content based on content type
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  contentType: ContentType;
  categories: ContentCategory[];
  tags: ContentTag[];
  media: ContentMedia[];
}

export interface ContentQuery {
  contentTypeId?: string;
  categoryId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}

// API Service Class
class ApiService {
  private baseUrl: string;
  private organizationSlug: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.organizationSlug = ORGANIZATION_SLUG;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
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

  // Content endpoints
  async getContent(query: ContentQuery = {}): Promise<ApiResponse<Content[]>> {
    const params = new URLSearchParams({
      organizationSlug: this.organizationSlug,
      ...Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    });

    const response = await this.request<{ data: ApiResponse<Content[]> }>(
      `/public/content?${params}`
    );
    return response.data;
  }

  async getContentById(id: string): Promise<Content> {
    const params = new URLSearchParams({
      organizationSlug: this.organizationSlug,
    });

    const response = await this.request<{ data: Content }>(
      `/public/content/${id}?${params}`
    );
    return response.data;
  }

  async getContentBySlug(slug: string): Promise<Content> {
    const params = new URLSearchParams({
      organizationSlug: this.organizationSlug,
    });

    const response = await this.request<{ data: Content }>(
      `/public/content/slug/${slug}?${params}`
    );
    return response.data;
  }

  // Categories endpoints
  async getCategories(): Promise<Category[]> {
    const params = new URLSearchParams({
      organizationSlug: this.organizationSlug,
    });

    const response = await this.request<{ data: Category[] }>(
      `/public/categories?${params}`
    );
    return response.data;
  }

  async createCategory(
    categoryData: CreateCategoryDto,
    authToken?: string
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
    authToken?: string
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

  async deleteCategory(id: string, authToken?: string): Promise<void> {
    return this.request<void>(
      `/categories/${id}`,
      {
        method: 'DELETE',
      },
      authToken
    );
  }

  async getCategoryById(id: string, authToken?: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {}, authToken);
  }

  // Tags endpoint
  async getTags(): Promise<Tag[]> {
    const params = new URLSearchParams({
      organizationSlug: this.organizationSlug,
    });

    const response = await this.request<{ data: Tag[] }>(
      `/public/tags?${params}`
    );
    return response.data;
  }

  // Content types endpoint
  async getContentTypes(): Promise<ContentType[]> {
    const params = new URLSearchParams({
      organizationSlug: this.organizationSlug,
    });

    const response = await this.request<{ data: ContentType[] }>(
      `/public/content-types?${params}`
    );
    return response.data;
  }

  // Helper method to get content by category slug
  async getContentByCategory(
    categorySlug: string,
    query: Omit<ContentQuery, 'categoryId'> = {}
  ): Promise<ApiResponse<Content[]>> {
    // First get the category to get its ID
    const categories = await this.getCategories();
    const category = categories.find(c => c.slug === categorySlug);

    if (!category) {
      throw new Error(`Category with slug '${categorySlug}' not found`);
    }

    return this.getContent({ ...query, categoryId: category.id });
  }

  // Helper method to get content by content type slug
  async getContentByContentType(
    contentTypeSlug: string,
    query: Omit<ContentQuery, 'contentTypeId'> = {}
  ): Promise<ApiResponse<Content[]>> {
    // First get the content types to get the ID
    const contentTypes = await this.getContentTypes();
    const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug);

    if (!contentType) {
      throw new Error(`Content type with slug '${contentTypeSlug}' not found`);
    }

    return this.getContent({ ...query, contentTypeId: contentType.id });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Types are already exported above, no need to re-export
