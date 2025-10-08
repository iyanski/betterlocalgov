import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOptimizationService } from '../common/services/query-optimization.service';
import { QueryCacheService } from '../common/services/query-cache.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentStatus } from '@prisma/client';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ContentService', () => {
  let service: ContentService;

  const mockPrismaService = {
    content: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    contentType: {
      findUnique: jest.fn(),
    },
    contentCategory: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    contentTag: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockQueryOptimizationService = {
    getOptimizedContentList: jest.fn(),
    getContentListMinimal: jest.fn(),
    getContentWithRelations: jest.fn(),
  };

  const mockQueryCacheService = {
    getCachedContentList: jest.fn(),
    invalidateContentCache: jest.fn(),
    clearAllCaches: jest.fn(),
    getStats: jest.fn(),
  };

  const mockContent = {
    id: 'content-1',
    title: 'Test Content',
    slug: 'test-content',
    content: {
      title: 'Test Content',
      content: 'This is test content',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueryOptimizationService,
          useValue: mockQueryOptimizationService,
        },
        {
          provide: QueryCacheService,
          useValue: mockQueryCacheService,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateContentDto = {
      title: 'New Content',
      slug: 'new-content',
      content: {
        title: 'New Content',
        content: 'This is new content',
      },
      contentTypeId: 'content-type-1',
      organizationId: 'org-1',
      categoryIds: ['category-1'],
      tagIds: ['tag-1'],
    };

    it('should create content successfully', async () => {
      mockPrismaService.content.findFirst.mockResolvedValue(null);
      mockPrismaService.contentType.findUnique.mockResolvedValue({
        id: 'content-type-1',
        name: 'Blog Post',
        slug: 'blog-post',
      });
      mockPrismaService.content.create.mockResolvedValue(mockContent);

      const result = await service.create(createDto, 'user-1');

      expect(mockPrismaService.content.findFirst).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          slug: 'new-content',
        },
      });
      expect(mockPrismaService.content.create).toHaveBeenCalledWith({
        data: {
          title: 'New Content',
          slug: 'new-content',
          content: {
            title: 'New Content',
            content: 'This is new content',
          },
          contentTypeId: 'content-type-1',
          organizationId: 'org-1',
          createdBy: 'user-1',
          updatedBy: 'user-1',
          categories: {
            create: [{ categoryId: 'category-1' }],
          },
          tags: {
            create: [{ tagId: 'tag-1' }],
          },
        },
        include: {
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          organization: {
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
      expect(result).toEqual(mockContent);
    });

    it('should throw ConflictException if content with same slug exists in organization', async () => {
      mockPrismaService.content.findFirst.mockResolvedValue(mockContent);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.content.create).not.toHaveBeenCalled();
    });

    it('should create content without categories and tags when not provided', async () => {
      const createDtoWithoutRelations = {
        ...createDto,
        categoryIds: undefined,
        tagIds: undefined,
      };
      mockPrismaService.content.findFirst.mockResolvedValue(null);
      mockPrismaService.contentType.findUnique.mockResolvedValue({
        id: 'content-type-1',
        name: 'Blog Post',
        slug: 'blog-post',
      });
      mockPrismaService.content.create.mockResolvedValue(mockContent);

      await service.create(createDtoWithoutRelations, 'user-1');

      expect(mockPrismaService.content.create).toHaveBeenCalledWith({
        data: {
          title: 'New Content',
          slug: 'new-content',
          content: {
            title: 'New Content',
            content: 'This is new content',
          },
          contentTypeId: 'content-type-1',
          organizationId: 'org-1',
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return all content for organization with default filters', async () => {
      const contents = [mockContent];
      mockPrismaService.content.findMany.mockResolvedValue(contents);
      mockPrismaService.content.count.mockResolvedValue(1);

      const result = await service.findAll('org-1');

      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
        },
        include: {
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          organization: {
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
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual({
        data: contents,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply content type filter', async () => {
      const contents = [mockContent];
      mockPrismaService.content.findMany.mockResolvedValue(contents);
      mockPrismaService.content.count.mockResolvedValue(1);

      await service.findAll('org-1', { contentTypeId: 'content-type-1' });

      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          contentTypeId: 'content-type-1',
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should apply status filter', async () => {
      const contents = [mockContent];
      mockPrismaService.content.findMany.mockResolvedValue(contents);
      mockPrismaService.content.count.mockResolvedValue(1);

      await service.findAll('org-1', { status: ContentStatus.PUBLISHED });

      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          status: ContentStatus.PUBLISHED,
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should apply category filter', async () => {
      const contents = [mockContent];
      mockPrismaService.content.findMany.mockResolvedValue(contents);
      mockPrismaService.content.count.mockResolvedValue(1);

      await service.findAll('org-1', { categoryId: 'category-1' });

      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          categories: {
            some: {
              categoryId: 'category-1',
            },
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should apply tag filter', async () => {
      const contents = [mockContent];
      mockPrismaService.content.findMany.mockResolvedValue(contents);
      mockPrismaService.content.count.mockResolvedValue(1);

      await service.findAll('org-1', { tagId: 'tag-1' });

      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          tags: {
            some: {
              tagId: 'tag-1',
            },
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should apply pagination', async () => {
      const contents = [mockContent];
      mockPrismaService.content.findMany.mockResolvedValue(contents);
      mockPrismaService.content.count.mockResolvedValue(1);

      await service.findAll('org-1', {}, 5, 10);

      expect(mockPrismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 5,
        skip: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return content by ID', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(mockContent);

      const result = await service.findOne('content-1', 'org-1');

      expect(mockPrismaService.content.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'content-1',
          organizationId: 'org-1',
        },
        include: {
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          organization: {
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
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(null);

      await expect(service.findOne('content-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return content by slug', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(mockContent);

      const result = await service.findBySlug('test-content', 'org-1');

      expect(mockPrismaService.content.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_slug: {
            organizationId: 'org-1',
            slug: 'test-content',
          },
        },
        include: {
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          organization: {
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
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('test-content', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateContentDto = {
      title: 'Updated Content',
      content: {
        title: 'Updated Content',
        content: 'This is updated content',
      },
      categoryIds: ['category-2'],
      tagIds: ['tag-2'],
    };

    it('should update content successfully', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(mockContent);
      mockPrismaService.content.findFirst.mockResolvedValue(null);
      mockPrismaService.contentCategory.deleteMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.contentTag.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.content.update.mockResolvedValue({
        ...mockContent,
        ...updateDto,
      });

      const result = await service.update(
        'content-1',
        updateDto,
        'user-1',
        'org-1',
      );

      expect(mockPrismaService.contentCategory.deleteMany).toHaveBeenCalledWith(
        {
          where: { contentId: 'content-1' },
        },
      );
      expect(mockPrismaService.contentTag.deleteMany).toHaveBeenCalledWith({
        where: { contentId: 'content-1' },
      });
      expect(mockPrismaService.content.update).toHaveBeenCalledWith({
        where: {
          id: 'content-1',
          organizationId: 'org-1',
        },
        data: {
          title: 'Updated Content',
          content: {
            title: 'Updated Content',
            content: 'This is updated content',
          },
          updatedBy: 'user-1',
          categories: {
            create: [{ categoryId: 'category-2' }],
          },
          tags: {
            create: [{ tagId: 'tag-2' }],
          },
        },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  color: true,
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          contentType: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              firstName: true,
              id: true,
              lastName: true,
              username: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  color: true,
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          updater: {
            select: {
              firstName: true,
              id: true,
              lastName: true,
              username: true,
            },
          },
        },
      });
      expect(result).toEqual({ ...mockContent, ...updateDto });
    });

    it('should throw NotFoundException if content not found', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(null);

      await expect(
        service.update('content-1', updateDto, 'user-1', 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if slug already exists in organization', async () => {
      const updateDtoWithSlug = {
        ...updateDto,
        slug: 'existing-slug',
      };
      mockPrismaService.content.findUnique.mockResolvedValue(mockContent);
      mockPrismaService.content.findFirst.mockResolvedValue(mockContent);

      await expect(
        service.update('content-1', updateDtoWithSlug, 'user-1', 'org-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should update content without categories and tags when not provided', async () => {
      const updateDtoWithoutRelations = {
        ...updateDto,
        categoryIds: undefined,
        tagIds: undefined,
      };
      mockPrismaService.content.findUnique.mockResolvedValue(mockContent);
      mockPrismaService.content.findFirst.mockResolvedValue(null);
      mockPrismaService.content.update.mockResolvedValue({
        ...mockContent,
        ...updateDtoWithoutRelations,
      });

      await service.update(
        'content-1',
        updateDtoWithoutRelations,
        'user-1',
        'org-1',
      );

      expect(mockPrismaService.content.update).toHaveBeenCalledWith({
        where: {
          id: 'content-1',
          organizationId: 'org-1',
        },
        data: {
          title: 'Updated Content',
          content: {
            title: 'Updated Content',
            content: 'This is updated content',
          },
          updatedBy: 'user-1',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should delete content successfully', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(mockContent);
      mockPrismaService.content.delete.mockResolvedValue(mockContent);

      const result = await service.remove('content-1', 'org-1');

      expect(mockPrismaService.content.delete).toHaveBeenCalledWith({
        where: {
          id: 'content-1',
          organizationId: 'org-1',
        },
      });
      expect(result).toEqual({ message: 'Content deleted successfully' });
    });

    it('should throw NotFoundException if content not found', async () => {
      mockPrismaService.content.findUnique.mockResolvedValue(null);

      await expect(service.remove('content-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
