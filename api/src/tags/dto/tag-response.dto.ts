import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the tag',
  })
  id: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of the tag',
  })
  name: string;

  @ApiProperty({
    example: 'javascript',
    description: 'URL-friendly slug for the tag',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'JavaScript related content',
    description: 'Description of the tag',
  })
  description?: string;

  @ApiPropertyOptional({
    example: '#F7DF1E',
    description: 'Hex color code for the tag',
  })
  color?: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this tag',
  })
  organizationId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who created this tag',
  })
  createdBy: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the tag was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the tag was last updated',
  })
  updatedAt: Date;
}

export class TagListResponseDto {
  @ApiProperty({
    type: [TagResponseDto],
    description: 'Array of tags',
  })
  tags: TagResponseDto[];

  @ApiProperty({
    example: 10,
    description: 'Total number of tags',
  })
  total: number;
}

export class TagDeleteResponseDto {
  @ApiProperty({
    example: 'Tag deleted successfully',
    description: 'Success message',
  })
  message: string;
}

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
    example: 'DRAFT',
    description: 'Current status of the content',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  })
  status: string;

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
}

export class TagContentResponseDto {
  @ApiProperty({
    type: [ContentResponseDto],
    description: 'Array of content items with this tag',
  })
  content: ContentResponseDto[];

  @ApiProperty({
    example: 25,
    description: 'Total number of content items with this tag',
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
