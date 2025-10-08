import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagContentQueryDto } from './dto/tag-content-query.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

describe('TagsController', () => {
  let controller: TagsController;
  let tagsService: TagsService;

  const mockTagsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getContentByTag: jest.fn(),
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

  const mockTag = {
    id: 'tag-1',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript related content',
    color: '#F7DF1E',
    isActive: true,
    organizationId: 'org-1',
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
      content: 5,
    },
  };

  const mockTagList = [mockTag];

  const mockContent = {
    id: 'content-1',
    title: 'JavaScript Tutorial',
    slug: 'javascript-tutorial',
    content: {
      title: 'JavaScript Tutorial',
      body: 'Learn JavaScript basics',
    },
    status: 'PUBLISHED',
    publishedAt: new Date(),
    contentType: {
      id: 'content-type-1',
      name: 'Tutorial',
      slug: 'tutorial',
    },
    creator: {
      id: 'user-1',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
    categories: [
      {
        category: {
          id: 'category-1',
          name: 'Programming',
          slug: 'programming',
          color: '#3B82F6',
        },
      },
    ],
    tags: [
      {
        tag: {
          id: 'tag-1',
          name: 'JavaScript',
          slug: 'javascript',
          color: '#F7DF1E',
        },
      },
    ],
  };

  const mockContentList = {
    tag: mockTag,
    content: [mockContent],
    total: 1,
    limit: 10,
    offset: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    tagsService = module.get<TagsService>(TagsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTagDto: CreateTagDto = {
      name: 'React',
      slug: 'react',
      description: 'React related content',
      color: '#61DAFB',
    };

    it('should create tag successfully', async () => {
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(createTagDto, mockRequest);

      expect(tagsService.create).toHaveBeenCalledWith(
        createTagDto,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should create tag without optional fields', async () => {
      const createDtoWithoutOptional = {
        name: 'React',
        slug: 'react',
      };
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(
        createDtoWithoutOptional,
        mockRequest,
      );

      expect(tagsService.create).toHaveBeenCalledWith(
        createDtoWithoutOptional,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should create tag with all fields', async () => {
      const fullCreateDto: CreateTagDto = {
        name: 'Full Tag',
        slug: 'full-tag',
        description: 'A full tag with all fields',
        color: '#FF6B35',
      };
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(fullCreateDto, mockRequest);

      expect(tagsService.create).toHaveBeenCalledWith(
        fullCreateDto,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException if tag with same name exists', async () => {
      mockTagsService.create.mockRejectedValue(
        new ConflictException('Tag with this name or slug already exists'),
      );

      await expect(
        controller.create(createTagDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(tagsService.create).toHaveBeenCalledWith(
        createTagDto,
        mockUser.id,
        mockUser.organizationId,
      );
    });

    it('should handle different user roles', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(createTagDto, ownerRequest);

      expect(tagsService.create).toHaveBeenCalledWith(
        createTagDto,
        ownerRequest.user.id,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should handle different color formats', async () => {
      const createDtoWithColor = {
        ...createTagDto,
        color: '#FF0000',
      };
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(createDtoWithColor, mockRequest);

      expect(tagsService.create).toHaveBeenCalledWith(
        createDtoWithColor,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      mockTagsService.findAll.mockResolvedValue(mockTagList);

      const result = await controller.findAll();

      expect(tagsService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockTagList);
    });

    it('should return empty array when no tags exist', async () => {
      mockTagsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(tagsService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should return tags with relations', async () => {
      const tagWithRelations = {
        ...mockTag,
        _count: {
          content: 10,
        },
      };
      mockTagsService.findAll.mockResolvedValue([tagWithRelations]);

      const result = await controller.findAll();

      expect(tagsService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([tagWithRelations]);
      expect(result[0]).toHaveProperty('_count');
      expect(result[0]._count).toHaveProperty('content');
    });

    it('should return tags with creator and updater', async () => {
      const tagWithUsers = {
        ...mockTag,
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
      };
      mockTagsService.findAll.mockResolvedValue([tagWithUsers]);

      const result = await controller.findAll();

      expect(tagsService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([tagWithUsers]);
      expect(result[0]).toHaveProperty('creator');
      expect(result[0]).toHaveProperty('updater');
    });
  });

  describe('findOne', () => {
    it('should return tag by ID', async () => {
      mockTagsService.findOne.mockResolvedValue(mockTag);

      const result = await controller.findOne('tag-1');

      expect(tagsService.findOne).toHaveBeenCalledWith('tag-1');
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockTagsService.findOne.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(controller.findOne('tag-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(tagsService.findOne).toHaveBeenCalledWith('tag-1');
    });

    it('should handle different tag IDs', async () => {
      mockTagsService.findOne.mockResolvedValue(mockTag);

      const result = await controller.findOne('different-id');

      expect(tagsService.findOne).toHaveBeenCalledWith('different-id');
      expect(result).toEqual(mockTag);
    });

    it('should return tag with all relations', async () => {
      const tagWithRelations = {
        ...mockTag,
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
          content: 5,
        },
      };
      mockTagsService.findOne.mockResolvedValue(tagWithRelations);

      const result = await controller.findOne('tag-1');

      expect(tagsService.findOne).toHaveBeenCalledWith('tag-1');
      expect(result).toEqual(tagWithRelations);
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('updater');
      expect(result).toHaveProperty('_count');
    });
  });

  describe('findBySlug', () => {
    it('should return tag by slug', async () => {
      mockTagsService.findBySlug.mockResolvedValue(mockTag);

      const result = await controller.findBySlug('javascript', mockRequest);

      expect(tagsService.findBySlug).toHaveBeenCalledWith(
        'javascript',
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException if tag not found by slug', async () => {
      mockTagsService.findBySlug.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(
        controller.findBySlug('non-existent-slug', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(tagsService.findBySlug).toHaveBeenCalledWith(
        'non-existent-slug',
        mockUser.organizationId,
      );
    });

    it('should handle different slug formats', async () => {
      const slug = 'my-awesome-tag-2024';
      mockTagsService.findBySlug.mockResolvedValue(mockTag);

      const result = await controller.findBySlug(slug, mockRequest);

      expect(tagsService.findBySlug).toHaveBeenCalledWith(
        slug,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should use organization ID from request user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockTagsService.findBySlug.mockResolvedValue(mockTag);

      const result = await controller.findBySlug(
        'javascript',
        differentOrgRequest,
      );

      expect(tagsService.findBySlug).toHaveBeenCalledWith(
        'javascript',
        'different-org',
      );
      expect(result).toEqual(mockTag);
    });
  });

  describe('getContentByTag', () => {
    const tagContentQueryDto: TagContentQueryDto = {
      limit: 10,
      offset: 0,
    };

    it('should return content by tag', async () => {
      mockTagsService.getContentByTag.mockResolvedValue(mockContentList);

      const result = await controller.getContentByTag(
        'tag-1',
        tagContentQueryDto,
      );

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        tagContentQueryDto,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should return content with default query', async () => {
      const emptyQuery: TagContentQueryDto = {};
      mockTagsService.getContentByTag.mockResolvedValue(mockContentList);

      const result = await controller.getContentByTag('tag-1', emptyQuery);

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        emptyQuery,
      );
      expect(result).toEqual(mockContentList);
    });

    it('should handle pagination', async () => {
      const paginationQuery: TagContentQueryDto = {
        limit: 5,
        offset: 10,
      };
      const paginatedContentList = {
        ...mockContentList,
        limit: 5,
        offset: 10,
      };
      mockTagsService.getContentByTag.mockResolvedValue(paginatedContentList);

      const result = await controller.getContentByTag('tag-1', paginationQuery);

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        paginationQuery,
      );
      expect(result).toEqual(paginatedContentList);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockTagsService.getContentByTag.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(
        controller.getContentByTag('tag-1', tagContentQueryDto),
      ).rejects.toThrow(NotFoundException);
      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        tagContentQueryDto,
      );
    });

    it('should return content with relations', async () => {
      const contentWithRelations = {
        ...mockContentList,
        content: [
          {
            ...mockContent,
            contentType: {
              id: 'content-type-1',
              name: 'Tutorial',
              slug: 'tutorial',
            },
            creator: {
              id: 'user-1',
              username: 'testuser',
              firstName: 'Test',
              lastName: 'User',
            },
            categories: [
              {
                category: {
                  id: 'category-1',
                  name: 'Programming',
                  slug: 'programming',
                  color: '#3B82F6',
                },
              },
            ],
            tags: [
              {
                tag: {
                  id: 'tag-1',
                  name: 'JavaScript',
                  slug: 'javascript',
                  color: '#F7DF1E',
                },
              },
            ],
          },
        ],
      };
      mockTagsService.getContentByTag.mockResolvedValue(contentWithRelations);

      const result = await controller.getContentByTag(
        'tag-1',
        tagContentQueryDto,
      );

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        tagContentQueryDto,
      );
      expect(result).toEqual(contentWithRelations);
      expect(result.content[0]).toHaveProperty('contentType');
      expect(result.content[0]).toHaveProperty('creator');
      expect(result.content[0]).toHaveProperty('categories');
      expect(result.content[0]).toHaveProperty('tags');
    });

    it('should return empty content list', async () => {
      const emptyContentList = {
        tag: mockTag,
        content: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
      mockTagsService.getContentByTag.mockResolvedValue(emptyContentList);

      const result = await controller.getContentByTag(
        'tag-1',
        tagContentQueryDto,
      );

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        tagContentQueryDto,
      );
      expect(result).toEqual(emptyContentList);
    });
  });

  describe('update', () => {
    const updateTagDto: UpdateTagDto = {
      name: 'Updated JavaScript',
      description: 'Updated JavaScript related content',
      color: '#FF6B35',
    };

    it('should update tag successfully', async () => {
      const updatedTag = { ...mockTag, ...updateTagDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(
        'tag-1',
        updateTagDto,
        mockRequest,
      );

      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        updateTagDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedTag);
    });

    it('should update tag with partial data', async () => {
      const partialUpdateDto = {
        name: 'Updated Name Only',
      };
      const updatedTag = { ...mockTag, ...partialUpdateDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(
        'tag-1',
        partialUpdateDto,
        mockRequest,
      );

      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        partialUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedTag);
    });

    it('should update tag slug only', async () => {
      const slugOnlyUpdateDto = {
        slug: 'updated-slug',
      };
      const updatedTag = { ...mockTag, ...slugOnlyUpdateDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(
        'tag-1',
        slugOnlyUpdateDto,
        mockRequest,
      );

      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        slugOnlyUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedTag);
    });

    it('should update tag color only', async () => {
      const colorOnlyUpdateDto = {
        color: '#FF0000',
      };
      const updatedTag = { ...mockTag, ...colorOnlyUpdateDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(
        'tag-1',
        colorOnlyUpdateDto,
        mockRequest,
      );

      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        colorOnlyUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockTagsService.update.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(
        controller.update('tag-1', updateTagDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        updateTagDto,
        mockUser.id,
      );
    });

    it('should throw ConflictException if name or slug already exists', async () => {
      mockTagsService.update.mockRejectedValue(
        new ConflictException('Tag with this name or slug already exists'),
      );

      await expect(
        controller.update('tag-1', updateTagDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        updateTagDto,
        mockUser.id,
      );
    });

    it('should handle different user IDs', async () => {
      const differentUserRequest: RequestWithUser = {
        user: { ...mockUser, id: 'different-user' },
      };
      const updatedTag = { ...mockTag, ...updateTagDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(
        'tag-1',
        updateTagDto,
        differentUserRequest,
      );

      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        updateTagDto,
        'different-user',
      );
      expect(result).toEqual(updatedTag);
    });
  });

  describe('remove', () => {
    it('should delete tag successfully', async () => {
      const deactivatedTag = { ...mockTag, isActive: false };
      mockTagsService.remove.mockResolvedValue(deactivatedTag);

      const result = await controller.remove('tag-1');

      expect(tagsService.remove).toHaveBeenCalledWith('tag-1');
      expect(result).toEqual(deactivatedTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockTagsService.remove.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(controller.remove('tag-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(tagsService.remove).toHaveBeenCalledWith('tag-1');
    });

    it('should handle different tag IDs', async () => {
      const deactivatedTag = { ...mockTag, isActive: false };
      mockTagsService.remove.mockResolvedValue(deactivatedTag);

      const result = await controller.remove('different-id');

      expect(tagsService.remove).toHaveBeenCalledWith('different-id');
      expect(result).toEqual(deactivatedTag);
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have tagsService injected', () => {
      expect(tagsService).toBeDefined();
    });

    it('should be an instance of TagsController', () => {
      expect(controller).toBeInstanceOf(TagsController);
    });
  });

  describe('authentication and authorization', () => {
    it('should use user ID from request user for create and update', async () => {
      const differentUserRequest: RequestWithUser = {
        user: { ...mockUser, id: 'different-user' },
      };
      mockTagsService.create.mockResolvedValue(mockTag);

      await controller.create(
        {
          name: 'Test',
          slug: 'test',
        },
        differentUserRequest,
      );

      expect(tagsService.create).toHaveBeenCalledWith(
        expect.any(Object),
        'different-user',
        'org-1',
      );
    });

    it('should use organization ID from request user for findBySlug', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: { ...mockUser, organizationId: 'different-org' },
      };
      mockTagsService.findBySlug.mockResolvedValue(mockTag);

      await controller.findBySlug('javascript', differentOrgRequest);

      expect(tagsService.findBySlug).toHaveBeenCalledWith(
        'javascript',
        'different-org',
      );
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockTagsService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll()).rejects.toThrow(serviceError);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockTagsService.create.mockRejectedValue(validationError);

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

  describe('tag content management', () => {
    it('should handle content queries with different parameters', async () => {
      const largeQuery: TagContentQueryDto = {
        limit: 50,
        offset: 0,
      };
      const largeContentList = {
        ...mockContentList,
        limit: 50,
        offset: 0,
      };
      mockTagsService.getContentByTag.mockResolvedValue(largeContentList);

      const result = await controller.getContentByTag('tag-1', largeQuery);

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        largeQuery,
      );
      expect(result).toEqual(largeContentList);
    });

    it('should handle content queries with offset', async () => {
      const offsetQuery: TagContentQueryDto = {
        limit: 10,
        offset: 20,
      };
      const offsetContentList = {
        ...mockContentList,
        limit: 10,
        offset: 20,
      };
      mockTagsService.getContentByTag.mockResolvedValue(offsetContentList);

      const result = await controller.getContentByTag('tag-1', offsetQuery);

      expect(tagsService.getContentByTag).toHaveBeenCalledWith(
        'tag-1',
        offsetQuery,
      );
      expect(result).toEqual(offsetContentList);
    });
  });

  describe('tag color management', () => {
    it('should handle different color formats', async () => {
      const createDtoWithColor = {
        name: 'Color Tag',
        slug: 'color-tag',
        color: '#FF0000',
      };
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(createDtoWithColor, mockRequest);

      expect(tagsService.create).toHaveBeenCalledWith(
        createDtoWithColor,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockTag);
    });

    it('should handle color updates', async () => {
      const colorUpdateDto = {
        color: '#00FF00',
      };
      const updatedTag = { ...mockTag, ...colorUpdateDto };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(
        'tag-1',
        colorUpdateDto,
        mockRequest,
      );

      expect(tagsService.update).toHaveBeenCalledWith(
        'tag-1',
        colorUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedTag);
    });
  });
});
