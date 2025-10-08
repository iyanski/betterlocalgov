import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let organizationsService: OrganizationsService;

  const mockOrganizationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUsers: jest.fn(),
  };

  const mockUser: RequestWithUser['user'] = {
    id: 'user-1',
    email: 'test@example.com',
    role: UserRole.EDITOR,
    organizationId: 'org-1',
  };

  const mockRequest: RequestWithUser = {
    user: mockUser,
  };

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
    description: 'A test organization',
    domain: 'test.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    updatedBy: 'user-1',
    creator: {
      id: 'user-1',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    updater: {
      id: 'user-1',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    _count: {
      users: 5,
      contentTypes: 3,
      categories: 10,
      tags: 15,
      content: 25,
      media: 8,
    },
  };

  const mockOrganizationList = [mockOrganization];

  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      username: 'user1',
      firstName: 'User',
      lastName: 'One',
      role: UserRole.OWNER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'User',
      lastName: 'Two',
      role: UserRole.EDITOR,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    organizationsService =
      module.get<OrganizationsService>(OrganizationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrganizationDto: CreateOrganizationDto = {
      name: 'New Organization',
      slug: 'new-org',
      description: 'A new organization',
      domain: 'neworg.com',
    };

    it('should create organization successfully', async () => {
      mockOrganizationsService.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(
        createOrganizationDto,
        mockRequest,
      );

      expect(organizationsService.create).toHaveBeenCalledWith(
        createOrganizationDto,
        mockUser.id,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should create organization without optional fields', async () => {
      const createDtoWithoutOptional = {
        name: 'New Organization',
        slug: 'new-org',
      };
      mockOrganizationsService.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(
        createDtoWithoutOptional,
        mockRequest,
      );

      expect(organizationsService.create).toHaveBeenCalledWith(
        createDtoWithoutOptional,
        mockUser.id,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should throw ConflictException if organization with same name exists', async () => {
      mockOrganizationsService.create.mockRejectedValue(
        new ConflictException(
          'Organization with this name or slug already exists',
        ),
      );

      await expect(
        controller.create(createOrganizationDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(organizationsService.create).toHaveBeenCalledWith(
        createOrganizationDto,
        mockUser.id,
      );
    });

    it('should handle different user roles', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(
        createOrganizationDto,
        ownerRequest,
      );

      expect(organizationsService.create).toHaveBeenCalledWith(
        createOrganizationDto,
        ownerRequest.user.id,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should create organization with all fields', async () => {
      const fullCreateDto: CreateOrganizationDto = {
        name: 'Full Organization',
        slug: 'full-org',
        description: 'A full organization with all fields',
        domain: 'fullorg.com',
      };
      mockOrganizationsService.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(fullCreateDto, mockRequest);

      expect(organizationsService.create).toHaveBeenCalledWith(
        fullCreateDto,
        mockUser.id,
      );
      expect(result).toEqual(mockOrganization);
    });
  });

  describe('findAll', () => {
    it('should return all organizations for OWNER role', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.findAll.mockResolvedValue(mockOrganizationList);

      const result = await controller.findAll(ownerRequest);

      expect(organizationsService.findAll).toHaveBeenCalledWith(
        ownerRequest.user.id,
        ownerRequest.user.role,
      );
      expect(result).toEqual(mockOrganizationList);
    });

    it('should throw ForbiddenException for non-OWNER roles', async () => {
      mockOrganizationsService.findAll.mockRejectedValue(
        new ForbiddenException('Only owners can view all organizations'),
      );

      await expect(controller.findAll(mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(organizationsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role,
      );
    });

    it('should return empty array when no organizations exist', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(ownerRequest);

      expect(organizationsService.findAll).toHaveBeenCalledWith(
        ownerRequest.user.id,
        ownerRequest.user.role,
      );
      expect(result).toEqual([]);
    });

    it('should return organizations with relations', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const organizationWithRelations = {
        ...mockOrganization,
        _count: {
          users: 10,
          contentTypes: 5,
          categories: 20,
          tags: 30,
          content: 50,
          media: 15,
        },
      };
      mockOrganizationsService.findAll.mockResolvedValue([
        organizationWithRelations,
      ]);

      const result = await controller.findAll(ownerRequest);

      expect(organizationsService.findAll).toHaveBeenCalledWith(
        ownerRequest.user.id,
        ownerRequest.user.role,
      );
      expect(result).toEqual([organizationWithRelations]);
      expect(result[0]).toHaveProperty('_count');
    });
  });

  describe('findOne', () => {
    it('should return organization by ID for OWNER role', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne('org-1', ownerRequest);

      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should return organization by ID for same organization user', async () => {
      const sameOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'org-1' },
      };
      mockOrganizationsService.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne('org-1', sameOrgRequest);

      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'org-1',
        sameOrgRequest.user.id,
        sameOrgRequest.user.role,
        sameOrgRequest.user.organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should throw ForbiddenException for different organization user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockOrganizationsService.findOne.mockRejectedValue(
        new ForbiddenException('You can only access your own organization'),
      );

      await expect(
        controller.findOne('org-1', differentOrgRequest),
      ).rejects.toThrow(ForbiddenException);
      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'org-1',
        differentOrgRequest.user.id,
        differentOrgRequest.user.role,
        differentOrgRequest.user.organizationId,
      );
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockOrganizationsService.findOne.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.findOne('org-1', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'org-1',
        mockUser.id,
        mockUser.role,
        mockUser.organizationId,
      );
    });

    it('should handle different organization IDs', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne('different-id', ownerRequest);

      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'different-id',
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });
  });

  describe('findBySlug', () => {
    it('should return organization by slug for OWNER role', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.findBySlug.mockResolvedValue(mockOrganization);

      const result = await controller.findBySlug('test-org', ownerRequest);

      expect(organizationsService.findBySlug).toHaveBeenCalledWith(
        'test-org',
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should return organization by slug for same organization user', async () => {
      const sameOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'org-1' },
      };
      mockOrganizationsService.findBySlug.mockResolvedValue(mockOrganization);

      const result = await controller.findBySlug('test-org', sameOrgRequest);

      expect(organizationsService.findBySlug).toHaveBeenCalledWith(
        'test-org',
        sameOrgRequest.user.id,
        sameOrgRequest.user.role,
        sameOrgRequest.user.organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should throw ForbiddenException for different organization user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockOrganizationsService.findBySlug.mockRejectedValue(
        new ForbiddenException('You can only access your own organization'),
      );

      await expect(
        controller.findBySlug('test-org', differentOrgRequest),
      ).rejects.toThrow(ForbiddenException);
      expect(organizationsService.findBySlug).toHaveBeenCalledWith(
        'test-org',
        differentOrgRequest.user.id,
        differentOrgRequest.user.role,
        differentOrgRequest.user.organizationId,
      );
    });

    it('should throw NotFoundException if organization not found by slug', async () => {
      mockOrganizationsService.findBySlug.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(
        controller.findBySlug('non-existent-slug', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(organizationsService.findBySlug).toHaveBeenCalledWith(
        'non-existent-slug',
        mockUser.id,
        mockUser.role,
        mockUser.organizationId,
      );
    });

    it('should handle different slug formats', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const slug = 'my-awesome-organization-2024';
      mockOrganizationsService.findBySlug.mockResolvedValue(mockOrganization);

      const result = await controller.findBySlug(slug, ownerRequest);

      expect(organizationsService.findBySlug).toHaveBeenCalledWith(
        slug,
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });
  });

  describe('getUsers', () => {
    it('should return users for OWNER role', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.getUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers('org-1', ownerRequest);

      expect(organizationsService.getUsers).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockUsers);
    });

    it('should return users for same organization user', async () => {
      const sameOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'org-1' },
      };
      mockOrganizationsService.getUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers('org-1', sameOrgRequest);

      expect(organizationsService.getUsers).toHaveBeenCalledWith(
        'org-1',
        sameOrgRequest.user.id,
        sameOrgRequest.user.role,
        sameOrgRequest.user.organizationId,
      );
      expect(result).toEqual(mockUsers);
    });

    it('should throw ForbiddenException for different organization user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockOrganizationsService.getUsers.mockRejectedValue(
        new ForbiddenException(
          'You can only access users in your own organization',
        ),
      );

      await expect(
        controller.getUsers('org-1', differentOrgRequest),
      ).rejects.toThrow(ForbiddenException);
      expect(organizationsService.getUsers).toHaveBeenCalledWith(
        'org-1',
        differentOrgRequest.user.id,
        differentOrgRequest.user.role,
        differentOrgRequest.user.organizationId,
      );
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockOrganizationsService.getUsers.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.getUsers('org-1', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(organizationsService.getUsers).toHaveBeenCalledWith(
        'org-1',
        mockUser.id,
        mockUser.role,
        mockUser.organizationId,
      );
    });

    it('should return empty users list', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.getUsers.mockResolvedValue([]);

      const result = await controller.getUsers('org-1', ownerRequest);

      expect(organizationsService.getUsers).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual([]);
    });

    it('should return users with all fields', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const usersWithAllFields = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          username: 'user1',
          firstName: 'User',
          lastName: 'One',
          role: UserRole.OWNER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockOrganizationsService.getUsers.mockResolvedValue(usersWithAllFields);

      const result = await controller.getUsers('org-1', ownerRequest);

      expect(organizationsService.getUsers).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(usersWithAllFields);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('role');
      expect(result[0]).toHaveProperty('isActive');
    });
  });

  describe('update', () => {
    const updateOrganizationDto: UpdateOrganizationDto = {
      name: 'Updated Organization',
      description: 'An updated organization',
      domain: 'updated.com',
    };

    it('should update organization successfully for OWNER role', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const updatedOrganization = {
        ...mockOrganization,
        ...updateOrganizationDto,
      };
      mockOrganizationsService.update.mockResolvedValue(updatedOrganization);

      const result = await controller.update(
        'org-1',
        updateOrganizationDto,
        ownerRequest,
      );

      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        updateOrganizationDto,
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(updatedOrganization);
    });

    it('should update organization for same organization user', async () => {
      const sameOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'org-1' },
      };
      const updatedOrganization = {
        ...mockOrganization,
        ...updateOrganizationDto,
      };
      mockOrganizationsService.update.mockResolvedValue(updatedOrganization);

      const result = await controller.update(
        'org-1',
        updateOrganizationDto,
        sameOrgRequest,
      );

      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        updateOrganizationDto,
        sameOrgRequest.user.id,
        sameOrgRequest.user.role,
        sameOrgRequest.user.organizationId,
      );
      expect(result).toEqual(updatedOrganization);
    });

    it('should throw ForbiddenException for different organization user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockOrganizationsService.update.mockRejectedValue(
        new ForbiddenException('You can only update your own organization'),
      );

      await expect(
        controller.update('org-1', updateOrganizationDto, differentOrgRequest),
      ).rejects.toThrow(ForbiddenException);
      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        updateOrganizationDto,
        differentOrgRequest.user.id,
        differentOrgRequest.user.role,
        differentOrgRequest.user.organizationId,
      );
    });

    it('should update organization with partial data', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const partialUpdateDto = {
        name: 'Updated Name Only',
      };
      const updatedOrganization = { ...mockOrganization, ...partialUpdateDto };
      mockOrganizationsService.update.mockResolvedValue(updatedOrganization);

      const result = await controller.update(
        'org-1',
        partialUpdateDto,
        ownerRequest,
      );

      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        partialUpdateDto,
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(updatedOrganization);
    });

    it('should update organization slug only', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const slugOnlyUpdateDto = {
        slug: 'updated-slug',
      };
      const updatedOrganization = { ...mockOrganization, ...slugOnlyUpdateDto };
      mockOrganizationsService.update.mockResolvedValue(updatedOrganization);

      const result = await controller.update(
        'org-1',
        slugOnlyUpdateDto,
        ownerRequest,
      );

      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        slugOnlyUpdateDto,
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(updatedOrganization);
    });

    it('should throw NotFoundException if organization not found', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.update.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(
        controller.update('org-1', updateOrganizationDto, ownerRequest),
      ).rejects.toThrow(NotFoundException);
      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        updateOrganizationDto,
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
    });

    it('should throw ConflictException if name or slug already exists', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.update.mockRejectedValue(
        new ConflictException(
          'Organization with this name or slug already exists',
        ),
      );

      await expect(
        controller.update('org-1', updateOrganizationDto, ownerRequest),
      ).rejects.toThrow(ConflictException);
      expect(organizationsService.update).toHaveBeenCalledWith(
        'org-1',
        updateOrganizationDto,
        ownerRequest.user.id,
        ownerRequest.user.role,
        ownerRequest.user.organizationId,
      );
    });
  });

  describe('remove', () => {
    it('should delete organization successfully for OWNER role', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const deactivatedOrganization = { ...mockOrganization, isActive: false };
      mockOrganizationsService.remove.mockResolvedValue(
        deactivatedOrganization,
      );

      const result = await controller.remove('org-1', ownerRequest);

      expect(organizationsService.remove).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        ownerRequest.user.role,
      );
      expect(result).toEqual(deactivatedOrganization);
    });

    it('should throw ForbiddenException for non-OWNER roles', async () => {
      mockOrganizationsService.remove.mockRejectedValue(
        new ForbiddenException('Only owners can delete organizations'),
      );

      await expect(controller.remove('org-1', mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(organizationsService.remove).toHaveBeenCalledWith(
        'org-1',
        mockUser.id,
        mockUser.role,
      );
    });

    it('should throw NotFoundException if organization not found', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockOrganizationsService.remove.mockRejectedValue(
        new NotFoundException('Organization not found'),
      );

      await expect(controller.remove('org-1', ownerRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(organizationsService.remove).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        ownerRequest.user.role,
      );
    });

    it('should handle different organization IDs', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      const deactivatedOrganization = { ...mockOrganization, isActive: false };
      mockOrganizationsService.remove.mockResolvedValue(
        deactivatedOrganization,
      );

      const result = await controller.remove('different-id', ownerRequest);

      expect(organizationsService.remove).toHaveBeenCalledWith(
        'different-id',
        ownerRequest.user.id,
        ownerRequest.user.role,
      );
      expect(result).toEqual(deactivatedOrganization);
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have organizationsService injected', () => {
      expect(organizationsService).toBeDefined();
    });

    it('should be an instance of OrganizationsController', () => {
      expect(controller).toBeInstanceOf(OrganizationsController);
    });
  });

  describe('authentication and authorization', () => {
    it('should use user ID from request user for create', async () => {
      const differentUserRequest: RequestWithUser = {
        user: { ...mockUser, id: 'different-user' },
      };
      mockOrganizationsService.create.mockResolvedValue(mockOrganization);

      await controller.create(
        {
          name: 'Test',
          slug: 'test',
        },
        differentUserRequest,
      );

      expect(organizationsService.create).toHaveBeenCalledWith(
        expect.any(Object),
        'different-user',
      );
    });

    it('should use user role from request user for findAll', async () => {
      const viewerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.VIEWER },
      };
      mockOrganizationsService.findAll.mockRejectedValue(
        new ForbiddenException('Only owners can view all organizations'),
      );

      await expect(controller.findAll(viewerRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(organizationsService.findAll).toHaveBeenCalledWith(
        viewerRequest.user.id,
        viewerRequest.user.role,
      );
    });

    it('should use organization ID from request user for findOne', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockOrganizationsService.findOne.mockRejectedValue(
        new ForbiddenException('You can only access your own organization'),
      );

      await expect(
        controller.findOne('org-1', differentOrgRequest),
      ).rejects.toThrow(ForbiddenException);
      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'org-1',
        differentOrgRequest.user.id,
        differentOrgRequest.user.role,
        'different-org',
      );
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockOrganizationsService.findAll.mockRejectedValue(serviceError);

      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      await expect(controller.findAll(ownerRequest)).rejects.toThrow(
        serviceError,
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockOrganizationsService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(
          {
            name: 'Test',
            slug: 'test',
          },
          mockRequest,
        ),
      ).rejects.toThrow(validationError);
    });
  });

  describe('role-based access control', () => {
    it('should allow OWNER to access all operations', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };

      // Test findAll
      mockOrganizationsService.findAll.mockResolvedValue(mockOrganizationList);
      await controller.findAll(ownerRequest);
      expect(organizationsService.findAll).toHaveBeenCalledWith(
        ownerRequest.user.id,
        UserRole.OWNER,
      );

      // Test findOne
      mockOrganizationsService.findOne.mockResolvedValue(mockOrganization);
      await controller.findOne('org-1', ownerRequest);
      expect(organizationsService.findOne).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        UserRole.OWNER,
        ownerRequest.user.organizationId,
      );

      // Test remove
      const deactivatedOrganization = { ...mockOrganization, isActive: false };
      mockOrganizationsService.remove.mockResolvedValue(
        deactivatedOrganization,
      );
      await controller.remove('org-1', ownerRequest);
      expect(organizationsService.remove).toHaveBeenCalledWith(
        'org-1',
        ownerRequest.user.id,
        UserRole.OWNER,
      );
    });

    it('should restrict non-OWNER roles from certain operations', async () => {
      const editorRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.EDITOR },
      };

      // Test findAll - should be forbidden
      mockOrganizationsService.findAll.mockRejectedValue(
        new ForbiddenException('Only owners can view all organizations'),
      );
      await expect(controller.findAll(editorRequest)).rejects.toThrow(
        ForbiddenException,
      );

      // Test remove - should be forbidden
      mockOrganizationsService.remove.mockRejectedValue(
        new ForbiddenException('Only owners can delete organizations'),
      );
      await expect(controller.remove('org-1', editorRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
