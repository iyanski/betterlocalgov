import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldDefinitionResponseDto {
  @ApiProperty({
    example: 'title',
    description: 'The name of the field',
  })
  name: string;

  @ApiProperty({
    example: 'Title',
    description: 'The display label for the field',
  })
  label: string;

  @ApiProperty({
    example: 'text',
    description: 'The type of the field',
    enum: ['text', 'textarea', 'number', 'boolean', 'date', 'media', 'select'],
  })
  type: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the field is required',
  })
  required?: boolean;

  @ApiPropertyOptional({
    example: 'Enter the title',
    description: 'Placeholder text for the field',
  })
  placeholder?: string;

  @ApiPropertyOptional({
    example: ['option1', 'option2'],
    description: 'Available options for select fields',
    type: [String],
  })
  options?: string[];
}

export class ContentTypeResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the content type',
  })
  id: string;

  @ApiProperty({
    example: 'Blog Post',
    description: 'The name of the content type',
  })
  name: string;

  @ApiProperty({
    example: 'blog-post',
    description: 'URL-friendly slug for the content type',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'A blog post content type',
    description: 'Description of the content type',
  })
  description?: string;

  @ApiProperty({
    description: 'Field definitions for this content type',
    type: [FieldDefinitionResponseDto],
  })
  fields: FieldDefinitionResponseDto[];

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this content type',
  })
  organizationId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who created this content type',
  })
  createdBy: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the content type was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the content type was last updated',
  })
  updatedAt: Date;
}

export class ContentTypeListResponseDto {
  @ApiProperty({
    type: [ContentTypeResponseDto],
    description: 'Array of content types',
  })
  contentTypes: ContentTypeResponseDto[];

  @ApiProperty({
    example: 10,
    description: 'Total number of content types',
  })
  total: number;
}

export class ContentTypeDeleteResponseDto {
  @ApiProperty({
    example: 'Content type deleted successfully',
    description: 'Success message',
  })
  message: string;
}
