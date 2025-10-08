import { Test, TestingModule } from '@nestjs/testing';
import { ContentTypesController } from './content-types.controller';
import { ContentTypesService } from './content-types.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

describe('ContentTypesController', () => {
  let controller: ContentTypesController;
  let contentTypesService: ContentTypesService;

  const mockContentTypesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  const mockFieldDefinition = {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'Enter the title',
  };

  const mockContentType = {
    id: 'content-type-1',
    name: 'Blog Post',
    slug: 'blog-post',
    description: 'A blog post content type',
    fields: [mockFieldDefinition],
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

  const mockContentTypeList = [mockContentType];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentTypesController],
      providers: [
        {
          provide: ContentTypesService,
          useValue: mockContentTypesService,
        },
      ],
    }).compile();

    controller = module.get<ContentTypesController>(ContentTypesController);
    contentTypesService = module.get<ContentTypesService>(ContentTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createContentTypeDto: CreateContentTypeDto = {
      name: 'New Content Type',
      slug: 'new-content-type',
      description: 'A new content type',
      fields: [mockFieldDefinition],
    };

    it('should create content type successfully', async () => {
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(createContentTypeDto, mockRequest);

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createContentTypeDto,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should create content type without description', async () => {
      const createDtoWithoutDescription = {
        ...createContentTypeDto,
        description: undefined,
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createDtoWithoutDescription,
        mockRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createDtoWithoutDescription,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should create content type with multiple fields', async () => {
      const createDtoWithMultipleFields = {
        ...createContentTypeDto,
        fields: [
          mockFieldDefinition,
          {
            name: 'body',
            label: 'Body',
            type: 'textarea',
            required: true,
            placeholder: 'Enter the body content',
          },
          {
            name: 'published',
            label: 'Published',
            type: 'boolean',
            required: false,
          },
        ],
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createDtoWithMultipleFields,
        mockRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createDtoWithMultipleFields,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should throw ConflictException if content type with same name exists', async () => {
      mockContentTypesService.create.mockRejectedValue(
        new ConflictException(
          'Content type with this name or slug already exists',
        ),
      );

      await expect(
        controller.create(createContentTypeDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(contentTypesService.create).toHaveBeenCalledWith(
        createContentTypeDto,
        mockUser.id,
        mockUser.organizationId,
      );
    });

    it('should handle different user roles', async () => {
      const ownerRequest: RequestWithUser = {
        user: { ...mockUser, role: UserRole.OWNER },
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createContentTypeDto,
        ownerRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createContentTypeDto,
        ownerRequest.user.id,
        ownerRequest.user.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should handle different field types', async () => {
      const createDtoWithDifferentFieldTypes = {
        ...createContentTypeDto,
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'text',
            required: true,
          },
          {
            name: 'content',
            label: 'Content',
            type: 'textarea',
            required: true,
          },
          {
            name: 'views',
            label: 'Views',
            type: 'number',
            required: false,
          },
          {
            name: 'featured',
            label: 'Featured',
            type: 'boolean',
            required: false,
          },
          {
            name: 'publishDate',
            label: 'Publish Date',
            type: 'date',
            required: false,
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: ['Technology', 'Business', 'Lifestyle'],
          },
        ],
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createDtoWithDifferentFieldTypes,
        mockRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createDtoWithDifferentFieldTypes,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });
  });

  describe('findAll', () => {
    it('should return all content types', async () => {
      mockContentTypesService.findAll.mockResolvedValue(mockContentTypeList);

      const result = await controller.findAll();

      expect(contentTypesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockContentTypeList);
    });

    it('should return empty array when no content types exist', async () => {
      mockContentTypesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(contentTypesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should return content types with relations', async () => {
      const contentTypeWithRelations = {
        ...mockContentType,
        _count: {
          content: 10,
        },
      };
      mockContentTypesService.findAll.mockResolvedValue([
        contentTypeWithRelations,
      ]);

      const result = await controller.findAll();

      expect(contentTypesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([contentTypeWithRelations]);
      expect(result[0]).toHaveProperty('_count');
      expect(result[0]._count).toHaveProperty('content');
    });
  });

  describe('findOne', () => {
    it('should return content type by ID', async () => {
      mockContentTypesService.findOne.mockResolvedValue(mockContentType);

      const result = await controller.findOne('content-type-1');

      expect(contentTypesService.findOne).toHaveBeenCalledWith(
        'content-type-1',
      );
      expect(result).toEqual(mockContentType);
    });

    it('should throw NotFoundException if content type not found', async () => {
      mockContentTypesService.findOne.mockRejectedValue(
        new NotFoundException('Content type not found'),
      );

      await expect(controller.findOne('content-type-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(contentTypesService.findOne).toHaveBeenCalledWith(
        'content-type-1',
      );
    });

    it('should handle different content type IDs', async () => {
      mockContentTypesService.findOne.mockResolvedValue(mockContentType);

      const result = await controller.findOne('different-id');

      expect(contentTypesService.findOne).toHaveBeenCalledWith('different-id');
      expect(result).toEqual(mockContentType);
    });

    it('should return content type with all relations', async () => {
      const contentTypeWithRelations = {
        ...mockContentType,
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
      mockContentTypesService.findOne.mockResolvedValue(
        contentTypeWithRelations,
      );

      const result = await controller.findOne('content-type-1');

      expect(contentTypesService.findOne).toHaveBeenCalledWith(
        'content-type-1',
      );
      expect(result).toEqual(contentTypeWithRelations);
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('updater');
      expect(result).toHaveProperty('_count');
    });
  });

  describe('findBySlug', () => {
    it('should return content type by slug', async () => {
      mockContentTypesService.findBySlug.mockResolvedValue(mockContentType);

      const result = await controller.findBySlug('blog-post', mockRequest);

      expect(contentTypesService.findBySlug).toHaveBeenCalledWith(
        'blog-post',
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should throw NotFoundException if content type not found by slug', async () => {
      mockContentTypesService.findBySlug.mockRejectedValue(
        new NotFoundException('Content type not found'),
      );

      await expect(
        controller.findBySlug('non-existent-slug', mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentTypesService.findBySlug).toHaveBeenCalledWith(
        'non-existent-slug',
        mockUser.organizationId,
      );
    });

    it('should handle different slug formats', async () => {
      const slug = 'my-awesome-content-type-2024';
      mockContentTypesService.findBySlug.mockResolvedValue(mockContentType);

      const result = await controller.findBySlug(slug, mockRequest);

      expect(contentTypesService.findBySlug).toHaveBeenCalledWith(
        slug,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should use organization ID from request user', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: {
          ...mockUser,
          organizationId: 'different-org',
        },
      };
      mockContentTypesService.findBySlug.mockResolvedValue(mockContentType);

      const result = await controller.findBySlug(
        'blog-post',
        differentOrgRequest,
      );

      expect(contentTypesService.findBySlug).toHaveBeenCalledWith(
        'blog-post',
        'different-org',
      );
      expect(result).toEqual(mockContentType);
    });
  });

  describe('update', () => {
    const updateContentTypeDto: UpdateContentTypeDto = {
      name: 'Updated Content Type',
      description: 'An updated content type',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          label: 'Body',
          type: 'textarea',
          required: true,
        },
      ],
    };

    it('should update content type successfully', async () => {
      const updatedContentType = {
        ...mockContentType,
        ...updateContentTypeDto,
      };
      mockContentTypesService.update.mockResolvedValue(updatedContentType);

      const result = await controller.update(
        'content-type-1',
        updateContentTypeDto,
        mockRequest,
      );

      expect(contentTypesService.update).toHaveBeenCalledWith(
        'content-type-1',
        updateContentTypeDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedContentType);
    });

    it('should update content type with partial data', async () => {
      const partialUpdateDto = {
        name: 'Updated Name Only',
      };
      const updatedContentType = { ...mockContentType, ...partialUpdateDto };
      mockContentTypesService.update.mockResolvedValue(updatedContentType);

      const result = await controller.update(
        'content-type-1',
        partialUpdateDto,
        mockRequest,
      );

      expect(contentTypesService.update).toHaveBeenCalledWith(
        'content-type-1',
        partialUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedContentType);
    });

    it('should update content type slug only', async () => {
      const slugOnlyUpdateDto = {
        slug: 'updated-slug',
      };
      const updatedContentType = { ...mockContentType, ...slugOnlyUpdateDto };
      mockContentTypesService.update.mockResolvedValue(updatedContentType);

      const result = await controller.update(
        'content-type-1',
        slugOnlyUpdateDto,
        mockRequest,
      );

      expect(contentTypesService.update).toHaveBeenCalledWith(
        'content-type-1',
        slugOnlyUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedContentType);
    });

    it('should throw NotFoundException if content type not found', async () => {
      mockContentTypesService.update.mockRejectedValue(
        new NotFoundException('Content type not found'),
      );

      await expect(
        controller.update('content-type-1', updateContentTypeDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(contentTypesService.update).toHaveBeenCalledWith(
        'content-type-1',
        updateContentTypeDto,
        mockUser.id,
      );
    });

    it('should throw ConflictException if name or slug already exists', async () => {
      mockContentTypesService.update.mockRejectedValue(
        new ConflictException(
          'Content type with this name or slug already exists',
        ),
      );

      await expect(
        controller.update('content-type-1', updateContentTypeDto, mockRequest),
      ).rejects.toThrow(ConflictException);
      expect(contentTypesService.update).toHaveBeenCalledWith(
        'content-type-1',
        updateContentTypeDto,
        mockUser.id,
      );
    });

    it('should update fields only', async () => {
      const fieldsOnlyUpdateDto = {
        fields: [
          {
            name: 'newField',
            label: 'New Field',
            type: 'text',
            required: false,
          },
        ],
      };
      const updatedContentType = { ...mockContentType, ...fieldsOnlyUpdateDto };
      mockContentTypesService.update.mockResolvedValue(updatedContentType);

      const result = await controller.update(
        'content-type-1',
        fieldsOnlyUpdateDto,
        mockRequest,
      );

      expect(contentTypesService.update).toHaveBeenCalledWith(
        'content-type-1',
        fieldsOnlyUpdateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedContentType);
    });
  });

  describe('remove', () => {
    it('should delete content type successfully', async () => {
      const deleteResult = { message: 'Content type deleted successfully' };
      mockContentTypesService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('content-type-1');

      expect(contentTypesService.remove).toHaveBeenCalledWith('content-type-1');
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException if content type not found', async () => {
      mockContentTypesService.remove.mockRejectedValue(
        new NotFoundException('Content type not found'),
      );

      await expect(controller.remove('content-type-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(contentTypesService.remove).toHaveBeenCalledWith('content-type-1');
    });

    it('should throw ConflictException if content type has existing content', async () => {
      mockContentTypesService.remove.mockRejectedValue(
        new ConflictException(
          'Cannot delete content type with existing content',
        ),
      );

      await expect(controller.remove('content-type-1')).rejects.toThrow(
        ConflictException,
      );
      expect(contentTypesService.remove).toHaveBeenCalledWith('content-type-1');
    });

    it('should handle different content type IDs', async () => {
      const deleteResult = { message: 'Content type deleted successfully' };
      mockContentTypesService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('different-id');

      expect(contentTypesService.remove).toHaveBeenCalledWith('different-id');
      expect(result).toEqual(deleteResult);
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have contentTypesService injected', () => {
      expect(contentTypesService).toBeDefined();
    });

    it('should be an instance of ContentTypesController', () => {
      expect(controller).toBeInstanceOf(ContentTypesController);
    });
  });

  describe('authentication and authorization', () => {
    it('should use organization ID from request user for findBySlug', async () => {
      const differentOrgRequest: RequestWithUser = {
        user: {
          ...mockUser,
          organizationId: 'different-org',
        },
      };
      mockContentTypesService.findBySlug.mockResolvedValue(mockContentType);

      await controller.findBySlug('blog-post', differentOrgRequest);

      expect(contentTypesService.findBySlug).toHaveBeenCalledWith(
        'blog-post',
        'different-org',
      );
    });

    it('should use user ID from request user for create and update', async () => {
      const differentUserRequest: RequestWithUser = {
        user: {
          ...mockUser,
          id: 'different-user',
        },
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      await controller.create(
        {
          name: 'Test',
          slug: 'test',
          fields: [],
        },
        differentUserRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        expect.any(Object),
        'different-user',
        'org-1',
      );
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockContentTypesService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll()).rejects.toThrow(serviceError);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockContentTypesService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(
          {
            name: 'Test',
            slug: 'test',
            fields: [],
          },
          mockRequest,
        ),
      ).rejects.toThrow(validationError);
    });
  });

  describe('field definitions', () => {
    it('should handle text fields', async () => {
      const createDtoWithTextField = {
        name: 'Test Type',
        slug: 'test-type',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'text',
            required: true,
            placeholder: 'Enter title',
          },
        ],
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createDtoWithTextField,
        mockRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createDtoWithTextField,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should handle select fields with options', async () => {
      const createDtoWithSelectField = {
        name: 'Test Type',
        slug: 'test-type',
        fields: [
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: ['Option 1', 'Option 2', 'Option 3'],
          },
        ],
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createDtoWithSelectField,
        mockRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createDtoWithSelectField,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });

    it('should handle boolean fields', async () => {
      const createDtoWithBooleanField = {
        name: 'Test Type',
        slug: 'test-type',
        fields: [
          {
            name: 'featured',
            label: 'Featured',
            type: 'boolean',
            required: false,
          },
        ],
      };
      mockContentTypesService.create.mockResolvedValue(mockContentType);

      const result = await controller.create(
        createDtoWithBooleanField,
        mockRequest,
      );

      expect(contentTypesService.create).toHaveBeenCalledWith(
        createDtoWithBooleanField,
        mockUser.id,
        mockUser.organizationId,
      );
      expect(result).toEqual(mockContentType);
    });
  });
});
