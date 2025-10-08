import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
    const existingOrganization = await this.prisma.organization.findFirst({
      where: {
        OR: [
          { name: createOrganizationDto.name },
          { slug: createOrganizationDto.slug },
        ],
      },
    });

    if (existingOrganization) {
      throw new ConflictException(
        'Organization with this name or slug already exists',
      );
    }

    return this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
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
            users: true,
            contentTypes: true,
            categories: true,
            tags: true,
            content: true,
            media: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole) {
    // Only OWNER can see all organizations
    if (userRole !== UserRole.OWNER) {
      throw new ForbiddenException('Only owners can view all organizations');
    }

    return this.prisma.organization.findMany({
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
            users: true,
            contentTypes: true,
            categories: true,
            tags: true,
            content: true,
            media: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    // Users can only access their own organization unless they are OWNER
    if (userRole !== UserRole.OWNER && userOrganizationId !== id) {
      throw new ForbiddenException('You can only access your own organization');
    }

    const organization = await this.prisma.organization.findUnique({
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
            users: true,
            contentTypes: true,
            categories: true,
            tags: true,
            content: true,
            media: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findBySlug(
    slug: string,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
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
            users: true,
            contentTypes: true,
            categories: true,
            tags: true,
            content: true,
            media: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Users can only access their own organization unless they are OWNER
    if (userRole !== UserRole.OWNER && userOrganizationId !== organization.id) {
      throw new ForbiddenException('You can only access your own organization');
    }

    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    // Users can only update their own organization unless they are OWNER
    if (userRole !== UserRole.OWNER && userOrganizationId !== id) {
      throw new ForbiddenException('You can only update your own organization');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (updateOrganizationDto.name || updateOrganizationDto.slug) {
      const existingOrganization = await this.prisma.organization.findFirst({
        where: {
          OR: [
            { name: updateOrganizationDto.name },
            { slug: updateOrganizationDto.slug },
          ],
          NOT: { id },
        },
      });

      if (existingOrganization) {
        throw new ConflictException(
          'Organization with this name or slug already exists',
        );
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...updateOrganizationDto,
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

  async remove(id: string, userId: string, userRole: UserRole) {
    // Only OWNER can delete organizations
    if (userRole !== UserRole.OWNER) {
      throw new ForbiddenException('Only owners can delete organizations');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            contentTypes: true,
            categories: true,
            tags: true,
            content: true,
            media: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Instead of deleting, we'll deactivate the organization
    return this.prisma.organization.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async getUsers(
    id: string,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    // Users can only access their own organization unless they are OWNER
    if (userRole !== UserRole.OWNER && userOrganizationId !== id) {
      throw new ForbiddenException(
        'You can only access users in your own organization',
      );
    }

    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.user.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
