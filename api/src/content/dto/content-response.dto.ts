import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContentResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the content',
  })
  id: string;

  @ApiProperty({
    example: 'My First Blog Post',
    description: 'The title of the content',
  })
  title: string;

  @ApiProperty({
    example: 'my-first-blog-post',
    description: 'URL-friendly slug for the content',
  })
  slug: string;

  @ApiProperty({
    example: { title: 'My Post', body: 'Content here...' },
    description: 'The content data as a JSON object',
  })
  content: Record<string, unknown>;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the content type',
  })
  contentTypeId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this content',
  })
  organizationId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who created this content',
  })
  createdBy: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who last updated this content',
  })
  updatedBy: string;

  @ApiPropertyOptional({
    example: 'DRAFT',
    description: 'Current status of the content',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  })
  status?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the content was published',
  })
  publishedAt?: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the content was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the content was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Content type information',
  })
  contentType: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Organization information',
  })
  organization: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({
    description: 'Creator information',
  })
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({
    description: 'Last updater information',
  })
  updater: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({
    description: 'Categories associated with this content',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            color: { type: 'string' },
          },
        },
      },
    },
  })
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  }>;

  @ApiProperty({
    description: 'Tags associated with this content',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        tag: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            color: { type: 'string' },
          },
        },
      },
    },
  })
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  }>;
}

export class ContentListResponseDto {
  @ApiProperty({
    type: [ContentResponseDto],
    description: 'Array of content items',
  })
  data: ContentResponseDto[];

  @ApiProperty({
    example: 25,
    description: 'Total number of content items',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 3,
    description: 'Total number of pages',
  })
  totalPages: number;
}

export class ContentDeleteResponseDto {
  @ApiProperty({
    example: 'Content deleted successfully',
    description: 'Success message',
  })
  message: string;
}
