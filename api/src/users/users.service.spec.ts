import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.EDITOR,
    isActive: true,
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    organization: {
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
    },
  };

  const mockOwnerUser = {
    ...mockUser,
    id: 'owner-1',
    email: 'owner@example.com',
    username: 'owner',
    role: UserRole.OWNER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.EDITOR,
      organizationId: 'org-1',
    };

    it('should create a user successfully for OWNER role', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(
        createDto,
        'owner-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: createDto.email }, { username: createDto.username }],
        },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          password: 'hashedPassword',
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
      expect(result).toEqual(mockUser);
    });

    it('should create a user successfully for EDITOR role in their own organization', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(
        createDto,
        'editor-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException for EDITOR role trying to create user in different organization', async () => {
      await expect(
        service.create(createDto, 'editor-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user with same email exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.create(createDto, 'owner-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user with same username exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.create(createDto, 'owner-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users for OWNER role', async () => {
      const users = [mockUser, mockOwnerUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll('owner-1', UserRole.OWNER, 'org-1');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
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
      expect(result).toEqual(users);
    });

    it('should return only organization users for EDITOR role', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll(
        'editor-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
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
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return user for OWNER role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(
        'user-1',
        'owner-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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
      expect(result).toEqual(mockUser);
    });

    it('should return user for EDITOR role if in same organization', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(
        'user-1',
        'editor-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException for EDITOR role if user not in same organization', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.findOne('user-1', 'editor-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-1', 'owner-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user with organization information', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
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
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
    };

    it('should update user for OWNER role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update(
        'user-1',
        updateDto,
        'owner-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...updateDto,
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
      expect(result).toEqual({ ...mockUser, ...updateDto });
    });

    it('should update user for EDITOR role if in same organization', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update(
        'user-1',
        updateDto,
        'editor-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(result).toEqual({ ...mockUser, ...updateDto });
    });

    it('should throw ForbiddenException for EDITOR role if user not in same organization', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.update(
          'user-1',
          updateDto,
          'editor-1',
          UserRole.EDITOR,
          'org-2',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-1', updateDto, 'owner-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.update('user-1', updateDto, 'owner-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should remove role and organizationId from updateDto for EDITOR role', async () => {
      const updateDtoWithRole = {
        ...updateDto,
        role: UserRole.OWNER,
        organizationId: 'org-2',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      await service.update(
        'user-1',
        updateDtoWithRole,
        'editor-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...updateDto,
        },
        select: expect.any(Object),
      });
    });

    it('should hash password if provided in updateDto', async () => {
      const updateDtoWithPassword = {
        ...updateDto,
        password: 'newpassword',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      await service.update(
        'user-1',
        updateDtoWithPassword,
        'owner-1',
        UserRole.OWNER,
        'org-1',
      );

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...updateDto,
          password: 'hashedPassword',
        },
        select: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should delete user for OWNER role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(
        'user-1',
        'owner-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should delete user for EDITOR role if in same organization', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(
        'user-1',
        'editor-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw ForbiddenException for EDITOR role if user not in same organization', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.remove('user-1', 'editor-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if trying to delete own account', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.remove('user-1', 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('user-1', 'owner-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
