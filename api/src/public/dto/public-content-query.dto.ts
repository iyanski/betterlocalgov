import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PublicContentQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by content type ID',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  contentTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag ID',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  tagId?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page (default: 10, max: 100)',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of items to skip',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Organization slug to filter content by',
    example: 'my-organization',
  })
  @IsString()
  organizationSlug: string;
}
