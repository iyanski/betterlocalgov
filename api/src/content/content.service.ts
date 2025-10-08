import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentStatus, Prisma } from '@prisma/client';
import { QueryOptimizationService } from '../common/services/query-optimization.service';
import { QueryCacheService } from '../common/services/query-cache.service';

interface ContentQuery {
  contentTypeId?: string;
  status?: ContentStatus;
  categoryId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}

interface ContentCreateData {
  title: string;
  slug: string;
  content: Prisma.InputJsonValue;
  contentTypeId: string;
  organizationId: string;
  createdBy: string;
  updatedBy: string;
  categories?: {
    create: { categoryId: string }[];
  };
  tags?: {
    create: { tagId: string }[];
  };
}

interface ContentWhereClause {
  organizationId: string;
  contentTypeId?: string;
  status?: ContentStatus;
  categories?: {
    some: {
      categoryId: string;
    };
  };
  tags?: {
    some: {
      tagId: string;
    };
  };
}

interface ContentUpdateData {
  title?: string;
  slug?: string;
  content?: Prisma.InputJsonValue;
  status?: ContentStatus;
  updatedBy: string;
  categories?: {
    create: { categoryId: string }[];
  };
  tags?: {
    create: { tagId: string }[];
  };
}

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private queryOptimization: QueryOptimizationService,
    private queryCache: QueryCacheService,
  ) {}

  async create(createContentDto: CreateContentDto, userId: string) {
    const existingContent = await this.prisma.content.findFirst({
      where: {
        organizationId: createContentDto.organizationId,
        slug: createContentDto.slug,
      },
    });

    if (existingContent) {
      throw new ConflictException('Content with this slug already exists');
    }

    const contentType = await this.prisma.contentType.findUnique({
      where: { id: createContentDto.contentTypeId },
    });

    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }

    // Prepare the data for content creation
    const contentData: ContentCreateData = {
      title: createContentDto.title,
      slug: createContentDto.slug,
      content: createContentDto.content,
      contentTypeId: createContentDto.contentTypeId,
      organizationId: createContentDto.organizationId,
      createdBy: userId,
      updatedBy: userId,
    };

    // Add categories if provided
    if (
      createContentDto.categoryIds &&
      createContentDto.categoryIds.length > 0
    ) {
      contentData.categories = {
        create: createContentDto.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      };
    }

    // Add tags if provided
    if (createContentDto.tagIds && createContentDto.tagIds.length > 0) {
      contentData.tags = {
        create: createContentDto.tagIds.map((tagId) => ({
          tagId,
        })),
      };
    }

    return this.prisma.content.create({
      data: contentData,
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        organization: {
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
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          include: {
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
          include: {
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
  }

  async findAll(
    organizationId: string,
    query?: ContentQuery,
    limit = 10,
    offset = 0,
  ) {
    const where: ContentWhereClause = {
      organizationId,
    };

    if (query?.contentTypeId) {
      where.contentTypeId = query.contentTypeId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.categoryId) {
      where.categories = {
        some: {
          categoryId: query.categoryId,
        },
      };
    }

    if (query?.tagId) {
      where.tags = {
        some: {
          tagId: query.tagId,
        },
      };
    }

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          organization: {
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
          updater: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          categories: {
            include: {
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
            include: {
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
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data: content,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, organizationId: string) {
    const content = await this.prisma.content.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        organization: {
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
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          include: {
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
          include: {
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

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }

  async findBySlug(slug: string, organizationId: string) {
    const content = await this.prisma.content.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        organization: {
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
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          include: {
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
          include: {
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

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
    userId: string,
    organizationId: string,
  ) {
    const existingContent = await this.prisma.content.findUnique({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingContent) {
      throw new NotFoundException('Content not found');
    }

    // Check for slug conflicts if slug is being updated
    if (
      updateContentDto.slug &&
      updateContentDto.slug !== existingContent.slug
    ) {
      const slugConflict = await this.prisma.content.findFirst({
        where: {
          organizationId,
          slug: updateContentDto.slug,
          id: { not: id },
        },
      });

      if (slugConflict) {
        throw new ConflictException('Content with this slug already exists');
      }
    }

    // Delete existing category and tag relationships
    await this.prisma.contentCategory.deleteMany({
      where: { contentId: id },
    });

    await this.prisma.contentTag.deleteMany({
      where: { contentId: id },
    });

    // Prepare update data
    const { categoryIds, tagIds, ...updateContentDtoWithoutIds } =
      updateContentDto;
    void categoryIds;
    void tagIds;
    const updateData: ContentUpdateData = {
      ...updateContentDtoWithoutIds,
      updatedBy: userId,
    };

    // Add categories if provided
    if (
      updateContentDto.categoryIds &&
      updateContentDto.categoryIds.length > 0
    ) {
      updateData.categories = {
        create: updateContentDto.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      };
    }

    // Add tags if provided
    if (updateContentDto.tagIds && updateContentDto.tagIds.length > 0) {
      updateData.tags = {
        create: updateContentDto.tagIds.map((tagId) => ({
          tagId,
        })),
      };
    }

    return this.prisma.content.update({
      where: {
        id,
        organizationId,
      },
      data: updateData,
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        organization: {
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
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          include: {
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
          include: {
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
  }

  async publish(id: string, userId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return this.prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedBy: userId,
      },
      include: {
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
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: {
          include: {
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
          include: {
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
  }

  async remove(id: string, organizationId: string) {
    const existingContent = await this.prisma.content.findUnique({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingContent) {
      throw new NotFoundException('Content not found');
    }

    await this.prisma.content.delete({
      where: {
        id,
        organizationId,
      },
    });

    return { message: 'Content deleted successfully' };
  }

  // Optimized query methods for large datasets

  /**
   * Get optimized content list with select statements for better performance
   */
  async findAllOptimized(
    organizationId: string,
    query?: ContentQuery,
    limit = 10,
    offset = 0,
  ) {
    return this.queryOptimization.getOptimizedContentList(organizationId, {
      limit,
      offset,
      status: query?.status,
      contentTypeId: query?.contentTypeId,
    });
  }

  /**
   * Get cached content list for frequently accessed data
   */
  async findAllCached(
    organizationId: string,
    query?: ContentQuery,
    limit = 10,
    offset = 0,
  ) {
    return this.queryCache.getCachedContentList(organizationId, {
      limit,
      offset,
      status: query?.status,
      contentTypeId: query?.contentTypeId,
    });
  }

  /**
   * Get minimal content list for large datasets (only essential fields)
   */
  async findAllMinimal(
    organizationId: string,
    query?: ContentQuery,
    limit = 20,
    offset = 0,
  ) {
    return this.queryOptimization.getContentListMinimal(organizationId, {
      limit,
      offset,
      status: query?.status,
    });
  }

  /**
   * Get content with optimized relations
   */
  async findOneWithRelations(id: string, organizationId: string) {
    return this.queryOptimization.getContentWithRelations(organizationId, id);
  }

  /**
   * Invalidate content cache after content operations
   */
  private invalidateContentCache(organizationId: string): void {
    this.queryCache.invalidateContentCache(organizationId);
  }
}
