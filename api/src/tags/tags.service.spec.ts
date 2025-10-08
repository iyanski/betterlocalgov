import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tag: {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(createTagDto, 'user-1', 'org-1');

      expect(prismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: createTagDto.name }, { slug: createTagDto.slug }],
        },
      });
      expect(prismaService.tag.create).toHaveBeenCalledWith({
        data: {
          ...createTagDto,
          organizationId: 'org-1',
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
              content: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTag);
    });

    it('should create tag without optional fields', async () => {
      const createDtoWithoutOptional = {
        name: 'React',
        slug: 'react',
      };
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(
        createDtoWithoutOptional,
        'user-1',
        'org-1',
      );

      expect(prismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: createDtoWithoutOptional.name },
            { slug: createDtoWithoutOptional.slug },
          ],
        },
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException if tag with same name exists', async () => {
      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);

      await expect(
        service.create(createTagDto, 'user-1', 'org-1'),
      ).rejects.toThrow(ConflictException);
      expect(prismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: createTagDto.name }, { slug: createTagDto.slug }],
        },
      });
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if tag with same slug exists', async () => {
      const existingTag = { ...mockTag, name: 'Different Name' };
      mockPrismaService.tag.findFirst.mockResolvedValue(existingTag);

      await expect(
        service.create(createTagDto, 'user-1', 'org-1'),
      ).rejects.toThrow(ConflictException);
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should handle different user IDs', async () => {
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(
        createTagDto,
        'different-user',
        'org-1',
      );

      expect(prismaService.tag.create).toHaveBeenCalledWith({
        data: {
          ...createTagDto,
          organizationId: 'org-1',
          createdBy: 'different-user',
          updatedBy: 'different-user',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTag);
    });

    it('should handle different organization IDs', async () => {
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(
        createTagDto,
        'user-1',
        'different-org',
      );

      expect(prismaService.tag.create).toHaveBeenCalledWith({
        data: {
          ...createTagDto,
          organizationId: 'different-org',
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTag);
    });
  });

  describe('findAll', () => {
    it('should return all active tags', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue(mockTagList);

      const result = await service.findAll();

      expect(prismaService.tag.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockTagList);
    });

    it('should return empty array when no tags exist', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(prismaService.tag.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([]);
    });

    it('should return tags with relations', async () => {
      const tagWithRelations = {
        ...mockTag,
        _count: {
          content: 10,
        },
      };
      mockPrismaService.tag.findMany.mockResolvedValue([tagWithRelations]);

      const result = await service.findAll();

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
      mockPrismaService.tag.findMany.mockResolvedValue([tagWithUsers]);

      const result = await service.findAll();

      expect(result).toEqual([tagWithUsers]);
      expect(result[0]).toHaveProperty('creator');
      expect(result[0]).toHaveProperty('updater');
    });
  });

  describe('findOne', () => {
    it('should return tag by ID', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne('tag-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
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
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne('tag-1')).rejects.toThrow(NotFoundException);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        include: expect.any(Object),
      });
    });

    it('should handle different tag IDs', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne('different-id');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'different-id' },
        include: expect.any(Object),
      });
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
      mockPrismaService.tag.findUnique.mockResolvedValue(tagWithRelations);

      const result = await service.findOne('tag-1');

      expect(result).toEqual(tagWithRelations);
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('updater');
      expect(result).toHaveProperty('_count');
    });
  });

  describe('findBySlug', () => {
    it('should return tag by slug', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findBySlug('javascript', 'org-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_slug: {
            organizationId: 'org-1',
            slug: 'javascript',
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
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException if tag not found by slug', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(
        service.findBySlug('non-existent-slug', 'org-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_slug: {
            organizationId: 'org-1',
            slug: 'non-existent-slug',
          },
        },
        include: expect.any(Object),
      });
    });

    it('should handle different slug formats', async () => {
      const slug = 'my-awesome-tag-2024';
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findBySlug(slug, 'org-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_slug: {
            organizationId: 'org-1',
            slug: slug,
          },
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTag);
    });

    it('should handle different organization IDs', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findBySlug('javascript', 'different-org');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_slug: {
            organizationId: 'different-org',
            slug: 'javascript',
          },
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTag);
    });
  });

  describe('update', () => {
    const updateTagDto: UpdateTagDto = {
      name: 'Updated JavaScript',
      description: 'Updated JavaScript related content',
      color: '#FF6B35',
    };

    it('should update tag successfully', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      const updatedTag = { ...mockTag, ...updateTagDto };
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update('tag-1', updateTagDto, 'user-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
      expect(prismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: updateTagDto.name }, { slug: updateTagDto.slug }],
          NOT: { id: 'tag-1' },
        },
      });
      expect(prismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        data: {
          ...updateTagDto,
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
      expect(result).toEqual(updatedTag);
    });

    it('should update tag with partial data', async () => {
      const partialUpdateDto = {
        name: 'Updated Name Only',
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      const updatedTag = { ...mockTag, ...partialUpdateDto };
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update('tag-1', partialUpdateDto, 'user-1');

      expect(prismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: partialUpdateDto.name },
            { slug: partialUpdateDto.slug },
          ],
          NOT: { id: 'tag-1' },
        },
      });
      expect(result).toEqual(updatedTag);
    });

    it('should update tag without name or slug changes', async () => {
      const updateDtoWithoutNameOrSlug = {
        description: 'Updated description only',
        color: '#FF0000',
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      const updatedTag = { ...mockTag, ...updateDtoWithoutNameOrSlug };
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update(
        'tag-1',
        updateDtoWithoutNameOrSlug,
        'user-1',
      );

      expect(prismaService.tag.findFirst).not.toHaveBeenCalled();
      expect(prismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        data: {
          ...updateDtoWithoutNameOrSlug,
          updatedBy: 'user-1',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(
        service.update('tag-1', updateTagDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
      expect(prismaService.tag.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if name already exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);

      await expect(
        service.update('tag-1', updateTagDto, 'user-1'),
      ).rejects.toThrow(ConflictException);
      expect(prismaService.tag.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      const updateDtoWithSlug = {
        slug: 'existing-slug',
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(mockTag);

      await expect(
        service.update('tag-1', updateDtoWithSlug, 'user-1'),
      ).rejects.toThrow(ConflictException);
      expect(prismaService.tag.update).not.toHaveBeenCalled();
    });

    it('should handle different user IDs', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      const updatedTag = { ...mockTag, ...updateTagDto };
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update(
        'tag-1',
        updateTagDto,
        'different-user',
      );

      expect(prismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        data: {
          ...updateTagDto,
          updatedBy: 'different-user',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedTag);
    });
  });

  describe('remove', () => {
    it('should deactivate tag successfully', async () => {
      const tagWithCount = {
        ...mockTag,
        _count: {
          content: 5,
        },
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(tagWithCount);
      const deactivatedTag = { ...tagWithCount, isActive: false };
      mockPrismaService.tag.update.mockResolvedValue(deactivatedTag);

      const result = await service.remove('tag-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        include: {
          _count: {
            select: {
              content: true,
            },
          },
        },
      });
      expect(prismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        data: {
          isActive: false,
        },
      });
      expect(result).toEqual(deactivatedTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.remove('tag-1')).rejects.toThrow(NotFoundException);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        include: {
          _count: {
            select: {
              content: true,
            },
          },
        },
      });
      expect(prismaService.tag.update).not.toHaveBeenCalled();
    });

    it('should handle different tag IDs', async () => {
      const tagWithCount = {
        ...mockTag,
        _count: {
          content: 5,
        },
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(tagWithCount);
      const deactivatedTag = { ...tagWithCount, isActive: false };
      mockPrismaService.tag.update.mockResolvedValue(deactivatedTag);

      const result = await service.remove('different-id');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'different-id' },
        include: {
          _count: {
            select: {
              content: true,
            },
          },
        },
      });
      expect(result).toEqual(deactivatedTag);
    });
  });

  describe('getContentByTag', () => {
    it('should return content by tag with default query', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.content.findMany.mockResolvedValue([mockContent]);
      mockPrismaService.content.count.mockResolvedValue(1);

      const result = await service.getContentByTag('tag-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
      expect(prismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          tags: {
            some: {
              tagId: 'tag-1',
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
      expect(prismaService.content.count).toHaveBeenCalledWith({
        where: {
          tags: {
            some: {
              tagId: 'tag-1',
            },
          },
          status: 'PUBLISHED',
        },
      });
      expect(result).toEqual({
        tag: mockTag,
        content: [mockContent],
        total: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should return content by tag with custom query', async () => {
      const query = { limit: 5, offset: 10 };
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.content.findMany.mockResolvedValue([mockContent]);
      mockPrismaService.content.count.mockResolvedValue(1);

      const result = await service.getContentByTag('tag-1', query);

      expect(prismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          tags: {
            some: {
              tagId: 'tag-1',
            },
          },
          status: 'PUBLISHED',
        },
        skip: 10,
        take: 5,
        orderBy: { publishedAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result).toEqual({
        tag: mockTag,
        content: [mockContent],
        total: 1,
        limit: 5,
        offset: 10,
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.getContentByTag('tag-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
      expect(prismaService.content.findMany).not.toHaveBeenCalled();
      expect(prismaService.content.count).not.toHaveBeenCalled();
    });

    it('should return empty content list', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.content.findMany.mockResolvedValue([]);
      mockPrismaService.content.count.mockResolvedValue(0);

      const result = await service.getContentByTag('tag-1');

      expect(result).toEqual({
        tag: mockTag,
        content: [],
        total: 0,
        limit: 10,
        offset: 0,
      });
    });

    it('should handle different tag IDs', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.content.findMany.mockResolvedValue([mockContent]);
      mockPrismaService.content.count.mockResolvedValue(1);

      const result = await service.getContentByTag('different-id');

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'different-id' },
      });
      expect(prismaService.content.findMany).toHaveBeenCalledWith({
        where: {
          tags: {
            some: {
              tagId: 'different-id',
            },
          },
          status: 'PUBLISHED',
        },
        skip: 0,
        take: 10,
        orderBy: { publishedAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result).toEqual({
        tag: mockTag,
        content: [mockContent],
        total: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should return content with relations', async () => {
      const contentWithRelations = {
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
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.content.findMany.mockResolvedValue([
        contentWithRelations,
      ]);
      mockPrismaService.content.count.mockResolvedValue(1);

      const result = await service.getContentByTag('tag-1');

      expect(result.content[0]).toHaveProperty('contentType');
      expect(result.content[0]).toHaveProperty('creator');
      expect(result.content[0]).toHaveProperty('categories');
      expect(result.content[0]).toHaveProperty('tags');
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have prismaService injected', () => {
      expect(prismaService).toBeDefined();
    });

    it('should be an instance of TagsService', () => {
      expect(service).toBeInstanceOf(TagsService);
    });
  });

  describe('error handling', () => {
    it('should propagate prisma errors', async () => {
      const prismaError = new Error('Database connection failed');
      mockPrismaService.tag.findMany.mockRejectedValue(prismaError);

      await expect(service.findAll()).rejects.toThrow(prismaError);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockPrismaService.tag.create.mockRejectedValue(validationError);

      await expect(
        service.create(
          {
            name: 'Test',
            slug: 'test',
          },
          'user-1',
          'org-1',
        ),
      ).rejects.toThrow(validationError);
    });
  });

  describe('database interactions', () => {
    it('should use correct prisma methods for create', async () => {
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      await service.create(
        {
          name: 'Test',
          slug: 'test',
        },
        'user-1',
        'org-1',
      );

      expect(prismaService.tag.findFirst).toHaveBeenCalled();
      expect(prismaService.tag.create).toHaveBeenCalled();
    });

    it('should use correct prisma methods for findAll', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prismaService.tag.findMany).toHaveBeenCalled();
    });

    it('should use correct prisma methods for findOne', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      await service.findOne('tag-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalled();
    });

    it('should use correct prisma methods for update', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.update.mockResolvedValue(mockTag);

      await service.update('tag-1', { name: 'Updated' }, 'user-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalled();
      expect(prismaService.tag.findFirst).toHaveBeenCalled();
      expect(prismaService.tag.update).toHaveBeenCalled();
    });

    it('should use correct prisma methods for remove', async () => {
      const tagWithCount = {
        ...mockTag,
        _count: { content: 0 },
      };
      mockPrismaService.tag.findUnique.mockResolvedValue(tagWithCount);
      mockPrismaService.tag.update.mockResolvedValue(tagWithCount);

      await service.remove('tag-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalled();
      expect(prismaService.tag.update).toHaveBeenCalled();
    });

    it('should use correct prisma methods for getContentByTag', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.content.findMany.mockResolvedValue([]);
      mockPrismaService.content.count.mockResolvedValue(0);

      await service.getContentByTag('tag-1');

      expect(prismaService.tag.findUnique).toHaveBeenCalled();
      expect(prismaService.content.findMany).toHaveBeenCalled();
      expect(prismaService.content.count).toHaveBeenCalled();
    });
  });
});
