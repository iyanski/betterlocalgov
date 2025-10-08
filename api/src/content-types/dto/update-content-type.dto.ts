import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldDefinitionDto } from './create-content-type.dto';

export class UpdateContentTypeDto {
  @ApiPropertyOptional({
    example: 'Updated Blog Post',
    description: 'The updated name of the content type',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'updated-blog-post',
    description: 'Updated URL-friendly slug for the content type',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 'An updated blog post content type',
    description: 'Updated description of the content type',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated field definitions for this content type',
    type: [FieldDefinitionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  fields?: FieldDefinitionDto[];
}
