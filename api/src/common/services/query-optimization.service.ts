import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Query optimization service for large datasets
 * Provides optimized query patterns with select statements
 */
@Injectable()
export class QueryOptimizationService {
  private readonly logger = new Logger(QueryOptimizationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Optimized content query for large datasets
   * Uses select instead of include for better performance
   */
  async getOptimizedContentList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      contentTypeId?: string;
    } = {},
  ) {
    const { limit = 10, offset = 0, status, contentTypeId } = options;

    const where: Record<string, unknown> = { organizationId };
    if (status) where.status = status;
    if (contentTypeId) where.contentTypeId = contentTypeId;

    const start = Date.now();

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 500) {
      this.logger.warn(`Slow content query: ${duration}ms`);
    }

    return {
      content,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Optimized content query with minimal data for lists
   * Perfect for large datasets where only basic info is needed
   */
  async getContentListMinimal(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {},
  ) {
    const { limit = 20, offset = 0, status } = options;

    const where: Record<string, unknown> = { organizationId };
    if (status) where.status = status;

    const start = Date.now();

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          contentType: {
            select: {
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 300) {
      this.logger.warn(`Slow minimal content query: ${duration}ms`);
    }

    return {
      content,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Optimized user query for large datasets
   * Uses select to limit returned fields
   */
  async getOptimizedUserList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const { limit = 20, offset = 0, isActive } = options;

    const where: Record<string, unknown> = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const start = Date.now();

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          organization: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 300) {
      this.logger.warn(`Slow user query: ${duration}ms`);
    }

    return {
      users,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Optimized media query for large datasets
   * Uses select to limit returned fields
   */
  async getOptimizedMediaList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      mimeType?: string;
    } = {},
  ) {
    const { limit = 20, offset = 0, mimeType } = options;

    const where: Record<string, unknown> = { organizationId };
    if (mimeType) where.mimeType = mimeType;

    const start = Date.now();

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          createdAt: true,
          creator: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 300) {
      this.logger.warn(`Slow media query: ${duration}ms`);
    }

    return {
      media,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Optimized category query for large datasets
   */
  async getOptimizedCategoryList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const { limit = 20, offset = 0, isActive } = options;

    const where: Record<string, unknown> = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const start = Date.now();

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              content: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 300) {
      this.logger.warn(`Slow category query: ${duration}ms`);
    }

    return {
      categories,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Optimized tag query for large datasets
   */
  async getOptimizedTagList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const { limit = 20, offset = 0, isActive } = options;

    const where: Record<string, unknown> = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const start = Date.now();

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              content: true,
            },
          },
        },
      }),
      this.prisma.tag.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 300) {
      this.logger.warn(`Slow tag query: ${duration}ms`);
    }

    return {
      tags,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Optimized content type query for large datasets
   */
  async getOptimizedContentTypeList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const { limit = 20, offset = 0, isActive } = options;

    const where: Record<string, unknown> = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const start = Date.now();

    const [contentTypes, total] = await Promise.all([
      this.prisma.contentType.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              content: true,
            },
          },
        },
      }),
      this.prisma.contentType.count({ where }),
    ]);

    const duration = Date.now() - start;
    if (duration > 300) {
      this.logger.warn(`Slow content type query: ${duration}ms`);
    }

    return {
      contentTypes,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get content with categories and tags (optimized for large datasets)
   * Uses select to limit fields and includes only necessary relations
   */
  async getContentWithRelations(organizationId: string, contentId: string) {
    const start = Date.now();

    const content = await this.prisma.content.findUnique({
      where: {
        id: contentId,
        organizationId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
      },
    });

    const duration = Date.now() - start;
    if (duration > 500) {
      this.logger.warn(`Slow content with relations query: ${duration}ms`);
    }

    return content;
  }

  /**
   * Get organization statistics (optimized)
   */
  async getOrganizationStats(organizationId: string) {
    const start = Date.now();

    const stats = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            users: true,
            content: true,
            media: true,
            categories: true,
            tags: true,
            contentTypes: true,
          },
        },
      },
    });

    const duration = Date.now() - start;
    if (duration > 500) {
      this.logger.warn(`Slow organization stats query: ${duration}ms`);
    }

    return stats;
  }
}
