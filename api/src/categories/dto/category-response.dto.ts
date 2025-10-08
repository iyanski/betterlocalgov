import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the category',
  })
  id: string;

  @ApiProperty({
    example: 'Technology',
    description: 'The name of the category',
  })
  name: string;

  @ApiProperty({
    example: 'technology',
    description: 'URL-friendly slug for the category',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Technology related content',
    description: 'Description of the category',
  })
  description?: string;

  @ApiPropertyOptional({
    example: '#3B82F6',
    description: 'Hex color code for the category',
  })
  color?: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this category',
  })
  organizationId: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the category was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the category was last updated',
  })
  updatedAt: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({
    type: [CategoryResponseDto],
    description: 'Array of categories',
  })
  categories: CategoryResponseDto[];

  @ApiProperty({
    example: 10,
    description: 'Total number of categories',
  })
  total: number;
}

export class CategoryContentResponseDto {
  @ApiProperty({
    type: [Object],
    description: 'Array of content items in this category',
  })
  content: unknown[];

  @ApiProperty({
    example: 25,
    description: 'Total number of content items in this category',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 0,
    description: 'Number of items skipped',
  })
  offset: number;
}
