import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserRole } from '@prisma/client';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const mockPrismaService = {
    organization: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
    description: 'Test organization',
    domain: 'test.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    updatedBy: 'user-1',
    _count: {
      users: 1,
      contentTypes: 2,
      categories: 3,
      tags: 4,
      content: 5,
      media: 6,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateOrganizationDto = {
      name: 'New Organization',
      slug: 'new-org',
      description: 'New organization',
      domain: 'new.com',
    };

    it('should create an organization successfully', async () => {
      mockPrismaService.organization.findFirst.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue(mockOrganization);

      const result = await service.create(createDto, 'user-1');

      expect(mockPrismaService.organization.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: createDto.name }, { slug: createDto.slug }],
        },
      });
      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          createdBy: 'user-1',
          updatedBy: 'user-1',
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
      expect(result).toEqual(mockOrganization);
    });

    it('should throw ConflictException if organization with same name exists', async () => {
      mockPrismaService.organization.findFirst.mockResolvedValue(
        mockOrganization,
      );

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.organization.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if organization with same slug exists', async () => {
      mockPrismaService.organization.findFirst.mockResolvedValue(
        mockOrganization,
      );

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.organization.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all organizations for OWNER role', async () => {
      const organizations = [mockOrganization];
      mockPrismaService.organization.findMany.mockResolvedValue(organizations);

      const result = await service.findAll('user-1', UserRole.OWNER);

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(organizations);
    });

    it('should throw ForbiddenException for EDITOR role', async () => {
      await expect(service.findAll('user-1', UserRole.EDITOR)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.organization.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return organization for OWNER role', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      const result = await service.findOne(
        'org-1',
        'user-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-1' },
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
      expect(result).toEqual(mockOrganization);
    });

    it('should return organization for EDITOR role if it is their organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      const result = await service.findOne(
        'org-1',
        'user-1',
        UserRole.EDITOR,
        'org-1',
      );

      expect(result).toEqual(mockOrganization);
    });

    it('should throw ForbiddenException for EDITOR role if not their organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      await expect(
        service.findOne('org-1', 'user-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('org-1', 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return organization for OWNER role', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      const result = await service.findBySlug(
        'test-org',
        'user-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-org' },
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
      expect(result).toEqual(mockOrganization);
    });

    it('should throw ForbiddenException for EDITOR role if not their organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      await expect(
        service.findBySlug('test-org', 'user-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.findBySlug('test-org', 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateOrganizationDto = {
      name: 'Updated Organization',
      description: 'Updated description',
    };

    it('should update organization for OWNER role', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );
      mockPrismaService.organization.findFirst.mockResolvedValue(null);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrganization,
        ...updateDto,
      });

      const result = await service.update(
        'org-1',
        updateDto,
        'user-1',
        UserRole.OWNER,
        'org-2',
      );

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: {
          ...updateDto,
          updatedBy: 'user-1',
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
      expect(result).toEqual({ ...mockOrganization, ...updateDto });
    });

    it('should throw ForbiddenException for EDITOR role if not their organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      await expect(
        service.update('org-1', updateDto, 'user-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.update('org-1', updateDto, 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if name/slug already exists', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );
      mockPrismaService.organization.findFirst.mockResolvedValue(
        mockOrganization,
      );

      await expect(
        service.update('org-1', updateDto, 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should deactivate organization for OWNER role', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue({
        ...mockOrganization,
        _count: {
          users: 1,
          contentTypes: 0,
          categories: 0,
          tags: 0,
          content: 0,
          media: 0,
        },
      });
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrganization,
        isActive: false,
      });

      const result = await service.remove(
        'org-1',
        'user-1',
        UserRole.OWNER,
        'org-1',
      );

      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { isActive: false },
      });
      expect(result).toEqual({ ...mockOrganization, isActive: false });
    });

    it('should throw ForbiddenException for EDITOR role', async () => {
      await expect(
        service.remove('org-1', 'user-1', UserRole.EDITOR, 'org-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('org-1', 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        firstName: 'User',
        lastName: 'One',
        role: UserRole.EDITOR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return users for OWNER role', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getUsers(
        'org-1',
        'user-1',
        UserRole.OWNER,
        'org-2',
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
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should throw ForbiddenException for EDITOR role if not their organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );

      await expect(
        service.getUsers('org-1', 'user-1', UserRole.EDITOR, 'org-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.getUsers('org-1', 'user-1', UserRole.OWNER, 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
