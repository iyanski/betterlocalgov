import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentQueryDto } from './dto/content-query.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ContentStatus, UserRole } from '@prisma/client';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

describe('ContentController', () => {
  let controller: ContentController;
  let contentService: ContentService;

  const mockContentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    remove: jest.fn(),
    findAllOptimized: jest.fn(),
    findAllCached: jest.fn(),
    findAllMinimal: jest.fn(),
    findOneWithRelations: jest.fn(),
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

  const mockContent = {
    id: 'content-1',
    title: 'Test Content',
    slug: 'test-content',
    content: {
      title: 'Test Content',
      body: 'This is test content',
    },
    status: ContentStatus.DRAFT,
    publishedAt: null,
    contentTypeId: 'content-type-1',
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    updatedBy: 'user-1',
    contentType: {
      id: 'content-type-1',
      name: 'Blog Post',
      slug: 'blog-post',
    },
    organization: {
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
    },
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
    categories: [
      {
        id: 'category-1',
        name: 'Technology',
        slug: 'technology',
        color: '#3B82F6',
      },
    ],
    tags: [
      {
        id: 'tag-1',
        name: 'JavaScript',
        slug: 'javascript',
        color: '#F7DF1E',
      },
    ],
  };

  const mockContentList = {
    data: [mockContent],
    pagination: {
      total: 1,
      limit: 10,
      offset: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    contentService = module.get<ContentService>(ContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createContentDto: CreateContentDto = {
      title: 'New Content',
      slug: 'new-content',
      content: {
        title: 'New Content',
        body: 'This is new content',
      },
      contentTypeId: 'content-type-1',
      organizationId: 'org-1',
      categoryIds: ['category-1'],
      tagIds: ['tag-1'],
    };

    it('should create content successfully', async () => {
      mockContentService.create.mockResolvedValue(mockContent);

      const result = await controller.create(createContentDto, mockRequest);

      expect(contentService.create).toHaveBeenCalledWith(
        createContentDto,
        mockUser.id,
      );
      expect(result).toEqual(mockContent);
    });

    it('should create content without categories and tags', async () => {
      const createDtoWithoutRelations = {
        ...createContentDto,
        categoryIds: undefined,
        tagIds: undefined,
      };
      mockContentService.create.mockResolvedValue(mockContent);

      const result = await controller.create(
        createDtoWithoutRelations,
        mockRequest,
      );

      expect(contentService.create).toHaveBeenCalledWith(
        createDtoWithoutRelations,
        mockUser.id,
      );
      expect(result).toEqual(mockContent);
    });

    it('should throw ConflictException if content with same slug exists', async () => {
      mockContentService.create.mockRejectedValue(
        new ConflictException('Content with slug already exists'),
      );

      await expect(
        controller.create(createContentDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(contentService.create).toHaveBeenCalledWith(
        createContentDto,
        mockUser.id,
      );
    });

    it('should handle different user roles', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockContentService.create.mockResolvedValue(mockContent);

      const result = await controller.create(createContentDto, ownerRequest);

      expect(contentService.create).toHaveBeenCalledWith(
        createContentDto,
        ownerRequest.user.id,
      );
      expect(result).toEqual(mockContent);
    });
  });

  describe('findAll', () => {
    const contentQueryDto: ContentQueryDto = {
      contentTypeId: 'content-type-1',
      status: ContentStatus.PUBLISHED,
      limit: 10,
      offset: 0,
    };

    it('should return all content for organization', async () => {
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(contentQueryDto, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        contentQueryDto,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should return content with default query', async () => {
      const emptyQuery: ContentQueryDto = {};
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(emptyQuery, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        emptyQuery,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should filter by content type', async () => {
      const typeQuery: ContentQueryDto = {
        contentTypeId: 'content-type-1',
      };
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(typeQuery, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        typeQuery,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should filter by status', async () => {
      const statusQuery: ContentQueryDto = {
        status: ContentStatus.DRAFT,
      };
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(statusQuery, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        statusQuery,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should filter by category', async () => {
      const categoryQuery: ContentQueryDto = {
        categoryId: 'category-1',
      };
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(categoryQuery, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        categoryQuery,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should filter by tag', async () => {
      const tagQuery: ContentQueryDto = {
        tagId: 'tag-1',
      };
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(tagQuery, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        tagQuery,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should handle pagination', async () => {
      const paginationQuery: ContentQueryDto = {
        limit: 5,
        offset: 10,
      };
      mockContentService.findAll.mockResolvedValue(mockContentList);

      const result = await controller.findAll(paginationQuery, mockRequest);

      expect(contentService.findAll).toHaveBeenCalledWith(
        mockUser.organizationId,
        paginationQuery,
      );
      expect(result).toEqual(mockContentList);
    });
  });

  describe('findOne', () => {
    it('should return content by ID', async () => {
      mockContentService.findOne.mockResolvedValue(mockContent);

      const result = await controller.findOne('content-1', mockRequest);

      expect(contentService.findOne).toHaveBeenCalledWith(
        'content-1',
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentService.findOne.mockRejectedValue(
        new NotFoundException('Content not found'),
      );

      await expect(
        controller.findOne('content-1', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentService.findOne).toHaveBeenCalledWith(
        'content-1',
        mockUser.organizationId,
      );
    });

    it('should handle different content IDs', async () => {
      mockContentService.findOne.mockResolvedValue(mockContent);

      const result = await controller.findOne('different-id', mockRequest);

      expect(contentService.findOne).toHaveBeenCalledWith(
        'different-id',
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContent);
    });
  });

  describe('findBySlug', () => {
    it('should return content by slug', async () => {
      mockContentService.findBySlug.mockResolvedValue(mockContent);

      const result = await controller.findBySlug('test-content', mockRequest);

      expect(contentService.findBySlug).toHaveBeenCalledWith(
        'test-content',
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found by slug', async () => {
      mockContentService.findBySlug.mockRejectedValue(
        new NotFoundException('Content not found'),
      );

      await expect(
        controller.findBySlug('non-existent-slug', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentService.findBySlug).toHaveBeenCalledWith(
        'non-existent-slug',
        mockUser.organizationId,
      );
    });

    it('should handle different slug formats', async () => {
      const slug = 'my-awesome-blog-post-2024';
      mockContentService.findBySlug.mockResolvedValue(mockContent);

      const result = await controller.findBySlug(slug, mockRequest);

      expect(contentService.findBySlug).toHaveBeenCalledWith(
        slug,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContent);
    });
  });

  describe('update', () => {
    const updateContentDto: UpdateContentDto = {
      title: 'Updated Content',
      content: {
        title: 'Updated Content',
        body: 'This is updated content',
      },
      categoryIds: ['category-2'],
      tagIds: ['tag-2'],
    };

    it('should update content successfully', async () => {
      const updatedContent = { ...mockContent, ...updateContentDto };
      mockContentService.update.mockResolvedValue(updatedContent);

      const result = await controller.update(
        'content-1',
        updateContentDto,
        mockRequest,
      );

      expect(contentService.update).toHaveBeenCalledWith(
        'content-1',
        updateContentDto,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(updatedContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentService.update.mockRejectedValue(
        new NotFoundException('Content not found'),
      );

      await expect(
        controller.update('content-1', updateContentDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentService.update).toHaveBeenCalledWith(
        'content-1',
        updateContentDto,
        mockUser.id,
        mockUser.organizationId,
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockContentService.update.mockRejectedValue(
        new ConflictException('Content with slug already exists'),
      );

      await expect(
        controller.update('content-1', updateContentDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(contentService.update).toHaveBeenCalledWith(
        'content-1',
        updateContentDto,
        mockUser.id,
        mockUser.organizationId,
      );
    });

    it('should update content without categories and tags', async () => {
      const updateDtoWithoutRelations = {
        ...updateContentDto,
        categoryIds: undefined,
        tagIds: undefined,
      };
      const updatedContent = { ...mockContent, ...updateDtoWithoutRelations };
      mockContentService.update.mockResolvedValue(updatedContent);

      const result = await controller.update(
        'content-1',
        updateDtoWithoutRelations,
        mockRequest,
      );

      expect(contentService.update).toHaveBeenCalledWith(
        'content-1',
        updateDtoWithoutRelations,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(updatedContent);
    });
  });

  describe('publish', () => {
    it('should publish content successfully', async () => {
      const publishedContent = {
        ...mockContent,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      };
      mockContentService.publish.mockResolvedValue(publishedContent);

      const result = await controller.publish('content-1', mockRequest);

      expect(contentService.publish).toHaveBeenCalledWith(
        'content-1',
        mockUser.id,
      );
      expect(result).toEqual(publishedContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentService.publish.mockRejectedValue(
        new NotFoundException('Content not found'),
      );

      await expect(
        controller.publish('content-1', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentService.publish).toHaveBeenCalledWith(
        'content-1',
        mockUser.id,
      );
    });

    it('should throw ConflictException if content already published', async () => {
      mockContentService.publish.mockRejectedValue(
        new ConflictException('Content is already published'),
      );

      await expect(
        controller.publish('content-1', mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(contentService.publish).toHaveBeenCalledWith(
        'content-1',
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should delete content successfully', async () => {
      const deleteResult = { message: 'Content deleted successfully' };
      mockContentService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('content-1', mockRequest);

      expect(contentService.remove).toHaveBeenCalledWith(
        'content-1',
        mockUser.organizationId,
      );
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentService.remove.mockRejectedValue(
        new NotFoundException('Content not found'),
      );

      await expect(controller.remove('content-1', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(contentService.remove).toHaveBeenCalledWith(
        'content-1',
        mockUser.organizationId,
      );
    });
  });

  describe('findAllOptimized', () => {
    const contentQueryDto: ContentQueryDto = {
      contentTypeId: 'content-type-1',
      limit: 10,
      offset: 0,
    };

    it('should return optimized content list', async () => {
      mockContentService.findAllOptimized.mockResolvedValue(mockContentList);

      const result = await controller.findAllOptimized(
        contentQueryDto,
        mockRequest,
      );

      expect(contentService.findAllOptimized).toHaveBeenCalledWith(
        mockUser.organizationId,
        contentQueryDto,
        contentQueryDto.limit,
        contentQueryDto.offset,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should handle default pagination values', async () => {
      const emptyQuery: ContentQueryDto = {};
      mockContentService.findAllOptimized.mockResolvedValue(mockContentList);

      const result = await controller.findAllOptimized(emptyQuery, mockRequest);

      expect(contentService.findAllOptimized).toHaveBeenCalledWith(
        mockUser.organizationId,
        emptyQuery,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockContentList);
    });
  });

  describe('findAllCached', () => {
    const contentQueryDto: ContentQueryDto = {
      contentTypeId: 'content-type-1',
      limit: 10,
      offset: 0,
    };

    it('should return cached content list', async () => {
      mockContentService.findAllCached.mockResolvedValue(mockContentList);

      const result = await controller.findAllCached(
        contentQueryDto,
        mockRequest,
      );

      expect(contentService.findAllCached).toHaveBeenCalledWith(
        mockUser.organizationId,
        contentQueryDto,
        contentQueryDto.limit,
        contentQueryDto.offset,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should handle different query parameters', async () => {
      const statusQuery: ContentQueryDto = {
        status: ContentStatus.PUBLISHED,
        limit: 5,
        offset: 10,
      };
      mockContentService.findAllCached.mockResolvedValue(mockContentList);

      const result = await controller.findAllCached(statusQuery, mockRequest);

      expect(contentService.findAllCached).toHaveBeenCalledWith(
        mockUser.organizationId,
        statusQuery,
        statusQuery.limit,
        statusQuery.offset,
      );
      expect(result).toEqual(mockContentList);
    });
  });

  describe('findAllMinimal', () => {
    const contentQueryDto: ContentQueryDto = {
      contentTypeId: 'content-type-1',
      limit: 10,
      offset: 0,
    };

    it('should return minimal content list', async () => {
      mockContentService.findAllMinimal.mockResolvedValue(mockContentList);

      const result = await controller.findAllMinimal(
        contentQueryDto,
        mockRequest,
      );

      expect(contentService.findAllMinimal).toHaveBeenCalledWith(
        mockUser.organizationId,
        contentQueryDto,
        contentQueryDto.limit,
        contentQueryDto.offset,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should handle large dataset queries', async () => {
      const largeQuery: ContentQueryDto = {
        limit: 100,
        offset: 0,
      };
      mockContentService.findAllMinimal.mockResolvedValue(mockContentList);

      const result = await controller.findAllMinimal(largeQuery, mockRequest);

      expect(contentService.findAllMinimal).toHaveBeenCalledWith(
        mockUser.organizationId,
        largeQuery,
        largeQuery.limit,
        largeQuery.offset,
      );
      expect(result).toEqual(mockContentList);
    });
  });

  describe('findOneWithRelations', () => {
    it('should return content with relations', async () => {
      mockContentService.findOneWithRelations.mockResolvedValue(mockContent);

      const result = await controller.findOneWithRelations(
        'content-1',
        mockRequest,
      );

      expect(contentService.findOneWithRelations).toHaveBeenCalledWith(
        'content-1',
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentService.findOneWithRelations.mockRejectedValue(
        new NotFoundException('Content not found'),
      );

      await expect(
        controller.findOneWithRelations('content-1', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentService.findOneWithRelations).toHaveBeenCalledWith(
        'content-1',
        mockUser.organizationId,
      );
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have contentService injected', () => {
      expect(contentService).toBeDefined();
    });

    it('should be an instance of ContentController', () => {
      expect(controller).toBeInstanceOf(ContentController);
    });
  });

  describe('authentication and authorization', () => {
    it('should use organization ID from request user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: {
          ...mockUser,
          organizationId: 'different-org',
        },
      };
      mockContentService.findAll.mockResolvedValue(mockContentList);

      await controller.findAll({}, differentOrgRequest);

      expect(contentService.findAll).toHaveBeenCalledWith('different-org', {});
    });

    it('should use user ID from request user', async () => {
      const differentUserRequest: RequestWithUser = {
        user: {
          ...mockUser,
          id: 'different-user',
        },
      };
      mockContentService.create.mockResolvedValue(mockContent);

      await controller.create(
        {
          title: 'Test',
          slug: 'test',
          content: {},
          contentTypeId: 'type-1',
          organizationId: 'org-1',
        },
        differentUserRequest,
      );

      expect(contentService.create).toHaveBeenCalledWith(
        expect.any(Object),
        'different-user',
      );
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockContentService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll({}, mockRequest)).rejects.toThrow(
        serviceError,
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockContentService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(
          {
            title: 'Test',
            slug: 'test',
            content: {},
            contentTypeId: 'type-1',
            organizationId: 'org-1',
          },
          mockRequest,
        ),
      ).rejects.toThrow(validationError);
    });
  });
});
