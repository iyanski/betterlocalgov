import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    example: 'Updated Technology',
    description: 'The updated name of the category',
    minLength: 1,
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'updated-technology',
    description: 'Updated URL-friendly slug for the category',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Updated technology related content',
    description: 'Updated description of the category',
    maxLength: 500,
  })
  description?: string;

  @ApiPropertyOptional({
    example: '#FF6B6B',
    description: 'Updated hex color code for the category',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  color?: string;
}
