/**
 * Type definitions for the API service
 */

// API Configuration types
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
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  _count?: {
    content: number;
  };
}

export interface CreateTagDto {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
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

export interface ContentTag {
  tag: Tag;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>; // Dynamic content based on content type
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  contentType: ContentType;
  categories: Category[];
  tags: Tag[];
  media: ContentMedia[];
}

export interface CreateContentDto {
  title: string;
  slug: string;
}

export interface UpdateContentDto {
  title?: string;
  slug?: string;
  content?: Record<string, unknown>;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  excerpt?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface ContentQuery {
  contentTypeId?: string;
  categoryId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}
