import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTagDto: CreateTagDto,
    userId: string,
    organizationId: string,
  ) {
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        OR: [{ name: createTagDto.name }, { slug: createTagDto.slug }],
      },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name or slug already exists');
    }

    return this.prisma.tag.create({
      data: {
        ...createTagDto,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
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
        _count: {
          select: {
            content: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      where: { isActive: true },
      include: {
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
        _count: {
          select: {
            content: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
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
        _count: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async findBySlug(slug: string, organizationId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
      include: {
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
        _count: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (updateTagDto.name || updateTagDto.slug) {
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          OR: [{ name: updateTagDto.name }, { slug: updateTagDto.slug }],
          NOT: { id },
        },
      });

      if (existingTag) {
        throw new ConflictException(
          'Tag with this name or slug already exists',
        );
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        ...updateTagDto,
        updatedBy: userId,
      },
      include: {
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
      },
    });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Instead of deleting, we'll deactivate the tag
    return this.prisma.tag.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async getContentByTag(
    tagId: string,
    query?: { limit?: number; offset?: number },
  ) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const limit = query?.limit || 10;
    const offset = query?.offset || 0;

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where: {
          tags: {
            some: {
              tagId,
            },
          },
          status: 'PUBLISHED',
        },
        skip: offset,
        take: limit,
        orderBy: { publishedAt: 'desc' },
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
      this.prisma.content.count({
        where: {
          tags: {
            some: {
              tagId,
            },
          },
          status: 'PUBLISHED',
        },
      }),
    ]);

    return {
      tag,
      content,
      total,
      limit,
      offset,
    };
  }
}
