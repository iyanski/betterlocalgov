import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';

import { Prisma } from '@prisma/client';

@Injectable()
export class ContentTypesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createContentTypeDto: CreateContentTypeDto,
    userId: string,
    organizationId: string,
  ) {
    const existingContentType = await this.prisma.contentType.findFirst({
      where: {
        OR: [
          { name: createContentTypeDto.name },
          { slug: createContentTypeDto.slug },
        ],
      },
    });

    if (existingContentType) {
      throw new ConflictException(
        'Content type with this name or slug already exists',
      );
    }

    return this.prisma.contentType.create({
      data: {
        ...createContentTypeDto,
        organizationId,
        fields: createContentTypeDto.fields as unknown as Prisma.InputJsonValue,
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
      },
    });
  }

  async findAll() {
    return this.prisma.contentType.findMany({
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
    });
  }

  async findOne(id: string) {
    const contentType = await this.prisma.contentType.findUnique({
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

    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }

    return contentType;
  }

  async findBySlug(slug: string, organizationId: string) {
    const contentType = await this.prisma.contentType.findUnique({
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
      },
    });

    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }

    return contentType;
  }

  async update(
    id: string,
    updateContentTypeDto: UpdateContentTypeDto,
    userId: string,
  ) {
    const contentType = await this.prisma.contentType.findUnique({
      where: { id },
    });

    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }

    if (updateContentTypeDto.name || updateContentTypeDto.slug) {
      const existingContentType = await this.prisma.contentType.findFirst({
        where: {
          OR: [
            { name: updateContentTypeDto.name },
            { slug: updateContentTypeDto.slug },
          ],
          NOT: { id },
        },
      });

      if (existingContentType) {
        throw new ConflictException(
          'Content type with this name or slug already exists',
        );
      }
    }

    const updateData: Record<string, unknown> = {
      ...updateContentTypeDto,
      updatedBy: userId,
    };

    if (updateContentTypeDto.fields) {
      updateData.fields =
        updateContentTypeDto.fields as unknown as Prisma.InputJsonValue;
    }

    return this.prisma.contentType.update({
      where: { id },
      data: updateData as unknown as Prisma.ContentTypeUpdateInput,
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
    const contentType = await this.prisma.contentType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }

    if (contentType._count.content > 0) {
      throw new ConflictException(
        'Cannot delete content type with existing content',
      );
    }

    await this.prisma.contentType.delete({
      where: { id },
    });

    return { message: 'Content type deleted successfully' };
  }
}
