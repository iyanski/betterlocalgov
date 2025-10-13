import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus, Prisma } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateContentDto {
  @ApiPropertyOptional({
    example: 'Updated Blog Post',
    description: 'The updated title of the content',
    minLength: 1,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'updated-blog-post',
    description: 'Updated URL-friendly slug for the content',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @ApiPropertyOptional({
    example: { title: 'Updated Post', body: 'Updated content here...' },
    description: 'Updated content data as a JSON object',
  })
  @IsOptional()
  content?: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    example: 'clx1234567890abcdef',
    description: 'Updated content type ID',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  contentTypeId?: string;

  @ApiPropertyOptional({
    example: ['clx1234567890abcdef'],
    description: 'Updated array of category IDs to associate with this content',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    example: ['clx1234567890abcdef'],
    description: 'Updated array of tag IDs to associate with this content',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    example: 'DRAFT',
    description: 'Updated status of the content',
    enum: ContentStatus,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
