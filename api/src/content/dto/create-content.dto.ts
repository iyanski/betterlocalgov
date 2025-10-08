import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateContentDto {
  @ApiProperty({
    example: 'My First Blog Post',
    description: 'The title of the content',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'my-first-blog-post',
    description: 'URL-friendly slug for the content',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: { title: 'My Post', body: 'Content here...' },
    description: 'The content data as a JSON object',
  })
  @IsObject()
  content: Record<string, unknown>;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the content type',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  contentTypeId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this content',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    example: ['clx1234567890abcdef'],
    description: 'Array of category IDs to associate with this content',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    example: ['clx1234567890abcdef'],
    description: 'Array of tag IDs to associate with this content',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
