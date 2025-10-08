import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    // Only OWNER can create users in any organization, EDITOR can only create users in their own organization
    if (
      userRole === UserRole.EDITOR &&
      createUserDto.organizationId !== userOrganizationId
    ) {
      throw new ForbiddenException(
        'You can only create users in your own organization',
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    // Users can only see users in their own organization unless they are OWNER
    const where =
      userRole === UserRole.OWNER ? {} : { organizationId: userOrganizationId };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only access users in their own organization unless they are OWNER
    if (
      userRole !== UserRole.OWNER &&
      user.organizationId !== userOrganizationId
    ) {
      throw new ForbiddenException(
        'You can only access users in your own organization',
      );
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only update users in their own organization unless they are OWNER
    if (
      userRole !== UserRole.OWNER &&
      user.organizationId !== userOrganizationId
    ) {
      throw new ForbiddenException(
        'You can only update users in your own organization',
      );
    }

    // EDITOR cannot change role or organizationId
    if (userRole === UserRole.EDITOR) {
      delete updateUserDto.role;
      delete updateUserDto.organizationId;
    }

    // Check for email/username conflicts if they are being updated
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
            ...(updateUserDto.username
              ? [{ username: updateUserDto.username }]
              : []),
          ],
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
    userOrganizationId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only delete users in their own organization unless they are OWNER
    if (
      userRole !== UserRole.OWNER &&
      user.organizationId !== userOrganizationId
    ) {
      throw new ForbiddenException(
        'You can only delete users in your own organization',
      );
    }

    // Prevent self-deletion
    if (id === userId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
