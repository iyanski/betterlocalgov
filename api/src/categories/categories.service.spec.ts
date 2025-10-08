import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  const mockCategory = {
    id: 'category-123',
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related content',
    color: '#3B82F6',
    isActive: true,
    organizationId: 'org-123',
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: 'user-123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    updater: {
      id: 'user-123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    _count: {
      content: 0,
    },
  };

  const mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    content: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related content',
        color: '#3B82F6',
      };

      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(
        createCategoryDto,
        'user-123',
        'org-123',
      );

      expect(prismaService.category.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: createCategoryDto.name },
            { slug: createCategoryDto.slug },
          ],
        },
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createCategoryDto,
          organizationId: 'org-123',
          createdBy: 'user-123',
          updatedBy: 'user-123',
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
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictException when category with same name exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related content',
        color: '#3B82F6',
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(
        service.create(createCategoryDto, 'user-123', 'org-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when category with same slug exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Technology',
        slug: 'technology',
        description: 'Technology related content',
        color: '#3B82F6',
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(
        service.create(createCategoryDto, 'user-123', 'org-123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all active categories', async () => {
      const mockCategories = [mockCategory];
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = 'category-123';
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
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
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const categoryId = 'non-existent-id';
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      const slug = 'technology';
      const organizationId = 'org-123';
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findBySlug(slug, organizationId);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found by slug', async () => {
      const slug = 'non-existent-slug';
      const organizationId = 'org-123';
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug(slug, organizationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = 'category-123';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Technology',
        description: 'Updated technology related content',
      };

      const updatedCategory = {
        ...mockCategory,
        ...updateCategoryDto,
        updatedBy: 'user-123',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(
        categoryId,
        updateCategoryDto,
        'user-123',
      );

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: {
          ...updateCategoryDto,
          updatedBy: 'user-123',
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
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when category not found for update', async () => {
      const categoryId = 'non-existent-id';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Technology',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update(categoryId, updateCategoryDto, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when name already exists during update', async () => {
      const categoryId = 'category-123';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Existing Technology',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(
        service.update(categoryId, updateCategoryDto, 'user-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when slug already exists during update', async () => {
      const categoryId = 'category-123';
      const updateCategoryDto: UpdateCategoryDto = {
        slug: 'existing-technology',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(
        service.update(categoryId, updateCategoryDto, 'user-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should update without conflict check when no name or slug provided', async () => {
      const categoryId = 'category-123';
      const updateCategoryDto: UpdateCategoryDto = {
        description: 'Updated description',
      };

      const updatedCategory = {
        ...mockCategory,
        ...updateCategoryDto,
        updatedBy: 'user-123',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(
        categoryId,
        updateCategoryDto,
        'user-123',
      );

      expect(prismaService.category.findFirst).not.toHaveBeenCalled();
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should deactivate a category successfully', async () => {
      const categoryId = 'category-123';
      const deactivatedCategory = {
        ...mockCategory,
        isActive: false,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(deactivatedCategory);

      const result = await service.remove(categoryId);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
        include: {
          _count: {
            select: {
              content: true,
            },
          },
        },
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: {
          isActive: false,
        },
      });
      expect(result).toEqual(deactivatedCategory);
    });

    it('should throw NotFoundException when category not found for deletion', async () => {
      const categoryId = 'non-existent-id';
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getContentByCategory', () => {
    it('should return content for a category with default pagination', async () => {
      const categoryId = 'category-123';
      const mockContent = [
        {
          id: 'content-123',
          title: 'Test Content',
          slug: 'test-content',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          contentType: {
            id: 'type-123',
            name: 'Article',
            slug: 'article',
          },
          creator: {
            id: 'user-123',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
          },
          categories: [],
          tags: [],
        },
      ];

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.content.findMany.mockResolvedValue(mockContent);
      mockPrismaService.content.count.mockResolvedValue(1);

      const result = await service.getContentByCategory(categoryId);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(prismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          categories: {
            some: {
              categoryId,
            },
          },
          status: 'PUBLISHED',
        },
        skip: 0,
        take: 10,
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
      });
      expect(result).toEqual({
        category: mockCategory,
        content: mockContent,
        total: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should return content for a category with custom pagination', async () => {
      const categoryId = 'category-123';
      const query = { limit: 5, offset: 10 };
      const mockContent = [];

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.content.findMany.mockResolvedValue(mockContent);
      mockPrismaService.content.count.mockResolvedValue(0);

      const result = await service.getContentByCategory(categoryId, query);

      expect(prismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          categories: {
            some: {
              categoryId,
            },
          },
          status: 'PUBLISHED',
        },
        skip: 10,
        take: 5,
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
      });
      expect(result).toEqual({
        category: mockCategory,
        content: mockContent,
        total: 0,
        limit: 5,
        offset: 10,
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      const categoryId = 'non-existent-id';
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.getContentByCategory(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have prismaService injected', () => {
      expect(prismaService).toBeDefined();
    });
  });
});
