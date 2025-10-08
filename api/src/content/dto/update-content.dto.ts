import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';
import { Prisma } from '@prisma/client';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @ApiPropertyOptional({
    example: 'Updated Blog Post',
    description: 'The updated title of the content',
    minLength: 1,
    maxLength: 200,
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'updated-blog-post',
    description: 'Updated URL-friendly slug for the content',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: { title: 'Updated Post', body: 'Updated content here...' },
    description: 'Updated content data as a JSON object',
  })
  content?: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    example: 'clx1234567890abcdef',
    description: 'Updated content type ID',
    minLength: 1,
  })
  contentTypeId?: string;

  @ApiPropertyOptional({
    example: ['clx1234567890abcdef'],
    description: 'Updated array of category IDs to associate with this content',
    type: [String],
  })
  categoryIds?: string[];

  @ApiPropertyOptional({
    example: ['clx1234567890abcdef'],
    description: 'Updated array of tag IDs to associate with this content',
    type: [String],
  })
  tagIds?: string[];
}
