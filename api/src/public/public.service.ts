import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    contentTypeId?: string;
    categoryId?: string;
    tagId?: string;
    limit?: number;
    offset?: number;
    organizationSlug?: string;
  }) {
    const {
      contentTypeId,
      categoryId,
      tagId,
      limit = 10,
      offset = 0,
      organizationSlug,
    } = query;
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }
    // Validate limit
    const validatedLimit = Math.min(Math.max(limit, 1), 100);

    // Get organization ID from slug
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Build where clause
    const where: {
      organizationId: string;
      status: ContentStatus;
      publishedAt: { not: null };
      contentTypeId?: string;
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
    } = {
      organizationId: organization.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: { not: null },
    };

    if (contentTypeId) {
      where.contentTypeId = contentTypeId;
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    // Get content with related data
    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
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
                  description: true,
                  color: true,
                },
              },
            },
          },
          media: {
            include: {
              media: {
                select: {
                  id: true,
                  filename: true,
                  originalName: true,
                  mimeType: true,
                  size: true,
                  url: true,
                },
              },
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: validatedLimit,
        skip: offset,
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data: content,
      pagination: {
        total,
        limit: validatedLimit,
        offset,
        hasMore: offset + validatedLimit < total,
      },
    };
  }

  async findOne(id: string, organizationSlug: string) {
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }
    const organization = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.content.findFirst({
      where: {
        id,
        organizationId: organization.id,
        status: ContentStatus.PUBLISHED,
        publishedAt: { not: null },
      },
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            fields: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
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
                description: true,
                color: true,
              },
            },
          },
        },
        media: {
          include: {
            media: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string, organizationSlug: string) {
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }
    const organization = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.content.findFirst({
      where: {
        slug,
        organizationId: organization.id,
        status: ContentStatus.PUBLISHED,
        publishedAt: { not: null },
      },
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            fields: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
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
                description: true,
                color: true,
              },
            },
          },
        },
        media: {
          include: {
            media: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async getCategories(organizationSlug: string) {
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }
    const organization = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.category.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        color: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTags(organizationSlug: string) {
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }
    const organization = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.tag.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        color: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getContentTypes(organizationSlug: string) {
    if (!organizationSlug) {
      throw new NotFoundException('Organization slug is required');
    }
    const organization = await this.prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.contentType.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        fields: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
