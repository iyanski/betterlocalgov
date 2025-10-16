import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentTypesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDocumentTypeDto: CreateDocumentTypeDto,
    userId: string,
    organizationId: string,
  ) {
    // Check if document type with same title or slug already exists
    const existingDocumentType = await this.prisma.documentType.findFirst({
      where: {
        OR: [
          { title: createDocumentTypeDto.title },
          { slug: createDocumentTypeDto.slug },
        ],
        organizationId,
      },
    });

    if (existingDocumentType) {
      throw new ConflictException(
        'Document type with this title or slug already exists',
      );
    }

    // Validate fields if provided
    if (createDocumentTypeDto.fields) {
      this.validateFormSchema({ fields: createDocumentTypeDto.fields });
    }

    return this.prisma.documentType.create({
      data: {
        title: createDocumentTypeDto.title,
        slug: createDocumentTypeDto.slug,
        description: createDocumentTypeDto.description,
        fields:
          createDocumentTypeDto.fields as unknown as Prisma.InputJsonValue,
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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });
  }

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ) {
    // Validate and sanitize parameters
    const validPage = Math.max(1, Math.floor(page) || 1);
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit) || 10)); // Cap at 100
    const skip = (validPage - 1) * validLimit;
    const where: Prisma.DocumentTypeWhereInput = {
      organizationId,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { slug: { contains: search } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [documentTypes, total] = await Promise.all([
      this.prisma.documentType.findMany({
        where,
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
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
              documents: true,
            },
          },
        },
      }),
      this.prisma.documentType.count({ where }),
    ]);

    return {
      data: documentTypes,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const documentType = await this.prisma.documentType.findFirst({
      where: {
        id,
        organizationId,
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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        documents: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    return documentType;
  }

  async findBySlug(slug: string, organizationId: string) {
    const documentType = await this.prisma.documentType.findFirst({
      where: {
        slug,
        organizationId,
        isActive: true,
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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    return documentType;
  }

  async update(
    id: string,
    updateDocumentTypeDto: UpdateDocumentTypeDto,
    userId: string,
    organizationId: string,
  ) {
    // Check if document type exists
    const existingDocumentType = await this.prisma.documentType.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingDocumentType) {
      throw new NotFoundException('Document type not found');
    }

    // Check for conflicts if title or slug is being updated
    if (updateDocumentTypeDto.title || updateDocumentTypeDto.slug) {
      const conflictConditions: Prisma.DocumentTypeWhereInput[] = [];

      if (updateDocumentTypeDto.title) {
        conflictConditions.push({ title: updateDocumentTypeDto.title });
      }
      if (updateDocumentTypeDto.slug) {
        conflictConditions.push({ slug: updateDocumentTypeDto.slug });
      }

      const conflictWhere: Prisma.DocumentTypeWhereInput = {
        id: { not: id },
        organizationId,
        OR: conflictConditions,
      };

      const conflictingDocumentType = await this.prisma.documentType.findFirst({
        where: conflictWhere,
      });

      if (conflictingDocumentType) {
        throw new ConflictException(
          'Document type with this title or slug already exists',
        );
      }
    }

    // Validate fields if provided
    if (updateDocumentTypeDto.fields) {
      this.validateFormSchema({ fields: updateDocumentTypeDto.fields });
    }

    return this.prisma.documentType.update({
      where: { id },
      data: {
        ...updateDocumentTypeDto,
        fields:
          updateDocumentTypeDto.fields as unknown as Prisma.InputJsonValue,
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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });
  }

  async remove(id: string, organizationId: string) {
    // Check if document type exists
    const existingDocumentType = await this.prisma.documentType.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!existingDocumentType) {
      throw new NotFoundException('Document type not found');
    }

    // Check if there are any documents using this type
    if (existingDocumentType._count.documents > 0) {
      throw new BadRequestException(
        'Cannot delete document type that has associated documents. Please delete or reassign the documents first.',
      );
    }

    return this.prisma.documentType.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async toggleActive(id: string, userId: string, organizationId: string) {
    const documentType = await this.prisma.documentType.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    return this.prisma.documentType.update({
      where: { id },
      data: {
        isActive: !documentType.isActive,
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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });
  }

  async getDocumentsByType(
    documentTypeId: string,
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Validate and sanitize parameters
    const validPage = Math.max(1, Math.floor(page) || 1);
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit) || 10)); // Cap at 100
    const skip = (validPage - 1) * validLimit;

    // Verify document type exists and belongs to organization
    const documentType = await this.prisma.documentType.findFirst({
      where: {
        id: documentTypeId,
        organizationId,
      },
    });

    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where: {
          documentTypeId,
          organizationId,
        },
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
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
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
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
                },
              },
            },
          },
        },
      }),
      this.prisma.document.count({
        where: {
          documentTypeId,
          organizationId,
        },
      }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateFormSchema(fields: any) {
    if (!fields || !Array.isArray(fields.fields)) {
      throw new BadRequestException(
        'Invalid form schema: fields must be an array',
      );
    }

    const fieldNames = new Set();
    const fieldIds = new Set();

    for (const field of fields.fields) {
      // Validate required properties
      if (!field.id || !field.name || !field.type || !field.label) {
        throw new BadRequestException(
          'Invalid field: id, name, type, and label are required',
        );
      }

      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        throw new BadRequestException(`Duplicate field name: ${field.name}`);
      }
      fieldNames.add(field.name);

      // Check for duplicate field IDs
      if (fieldIds.has(field.id)) {
        throw new BadRequestException(`Duplicate field ID: ${field.id}`);
      }
      fieldIds.add(field.id);

      // Validate field type
      const validTypes = [
        'text',
        'textarea',
        'number',
        'email',
        'date',
        'checkbox',
        'select',
      ];
      if (!validTypes.includes(field.type)) {
        throw new BadRequestException(
          `Invalid field type: ${field.type}. Valid types are: ${validTypes.join(', ')}`,
        );
      }

      // Validate select field options
      if (
        field.type === 'select' &&
        (!field.options ||
          !Array.isArray(field.options) ||
          field.options.length === 0)
      ) {
        throw new BadRequestException(
          'Select fields must have at least one option',
        );
      }

      // Validate validation rules
      if (field.validation) {
        if (
          field.validation.minLength !== undefined &&
          field.validation.minLength < 0
        ) {
          throw new BadRequestException('minLength must be non-negative');
        }
        if (
          field.validation.maxLength !== undefined &&
          field.validation.maxLength < 0
        ) {
          throw new BadRequestException('maxLength must be non-negative');
        }
        if (
          field.validation.minLength !== undefined &&
          field.validation.maxLength !== undefined &&
          field.validation.minLength > field.validation.maxLength
        ) {
          throw new BadRequestException(
            'minLength cannot be greater than maxLength',
          );
        }
        if (
          field.validation.min !== undefined &&
          field.validation.max !== undefined &&
          field.validation.min > field.validation.max
        ) {
          throw new BadRequestException('min cannot be greater than max');
        }
      }
    }
  }
}
