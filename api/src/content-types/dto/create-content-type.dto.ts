import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FieldDefinitionDto {
  @ApiProperty({
    example: 'title',
    description: 'The name of the field',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Title',
    description: 'The display label for the field',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    example: 'text',
    description: 'The type of the field',
    enum: ['text', 'textarea', 'number', 'boolean', 'date', 'media', 'select'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: true,
    description: 'Whether the field is required',
    required: false,
  })
  @IsOptional()
  required?: boolean;

  @ApiProperty({
    example: 'Enter the title',
    description: 'Placeholder text for the field',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({
    example: ['option1', 'option2'],
    description: 'Available options for select fields',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateContentTypeDto {
  @ApiProperty({
    example: 'Blog Post',
    description: 'The name of the content type',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'blog-post',
    description: 'URL-friendly slug for the content type',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'A blog post content type',
    description: 'Description of the content type',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Field definitions for this content type',
    type: [FieldDefinitionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  fields: FieldDefinitionDto[];
}
