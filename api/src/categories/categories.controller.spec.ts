import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryContentQueryDto } from './dto/category-content-query.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: UserRole.OWNER,
    organizationId: 'org-123',
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findBySlug: jest.fn(),
            getContentByCategory: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
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

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockCategory);

      const mockRequest: RequestWithUser = { user: mockUser };
      const result = await controller.create(createCategoryDto, mockRequest);

      expect(createSpy).toHaveBeenCalledWith(
        createCategoryDto,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictException when category already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related content',
        color: '#3B82F6',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new ConflictException(
            'Category with this name or slug already exists',
          ),
        );

      const mockRequest: RequestWithUser = { user: mockUser };
      await expect(
        controller.create(createCategoryDto, mockRequest),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = 'category-123';
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCategory);

      const result = await controller.findOne(categoryId);

      expect(service.findOne).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const categoryId = 'non-existent-id';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.findOne(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      const slug = 'technology';
      jest.spyOn(service, 'findBySlug').mockResolvedValue(mockCategory);

      const mockRequest: RequestWithUser = { user: mockUser };
      const result = await controller.findBySlug(slug, mockRequest);

      expect(service.findBySlug).toHaveBeenCalledWith(
        slug,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found by slug', async () => {
      const slug = 'non-existent-slug';
      jest
        .spyOn(service, 'findBySlug')
        .mockRejectedValue(new NotFoundException('Category not found'));

      const mockRequest: RequestWithUser = { user: mockUser };
      await expect(controller.findBySlug(slug, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getContentByCategory', () => {
    it('should return content for a category', async () => {
      const categoryId = 'category-123';
      const query: CategoryContentQueryDto = {
        limit: 10,
        offset: 0,
      };

      const mockContent = {
        data: [
          {
            id: 'content-123',
            title: 'Test Content',
            slug: 'test-content',
            status: 'PUBLISHED',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      jest
        .spyOn(service, 'getContentByCategory')
        .mockResolvedValue(mockContent);

      const result = await controller.getContentByCategory(categoryId, query);

      expect(service.getContentByCategory).toHaveBeenCalledWith(
        categoryId,
        query,
      );
      expect(result).toEqual(mockContent);
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
        updatedBy: mockUser.id,
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedCategory);

      const mockRequest: RequestWithUser = { user: mockUser };
      const result = await controller.update(
        categoryId,
        updateCategoryDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when category not found for update', async () => {
      const categoryId = 'non-existent-id';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Technology',
      };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('Category not found'));

      const mockRequest: RequestWithUser = { user: mockUser };
      await expect(
        controller.update(categoryId, updateCategoryDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when slug already exists during update', async () => {
      const categoryId = 'category-123';
      const updateCategoryDto: UpdateCategoryDto = {
        slug: 'existing-slug',
      };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new ConflictException('Category with this slug already exists'),
        );

      const mockRequest: RequestWithUser = { user: mockUser };
      await expect(
        controller.update(categoryId, updateCategoryDto, mockRequest),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a category successfully', async () => {
      const categoryId = 'category-123';

      jest.spyOn(service, 'remove').mockResolvedValue(mockCategory);

      const result = await controller.remove(categoryId);

      expect(service.remove).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found for deletion', async () => {
      const categoryId = 'non-existent-id';

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(controller.remove(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have categoriesService injected', () => {
      expect(service).toBeDefined();
    });
  });
});
