import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FormFieldValidationDto {
  @ApiProperty({
    example: 5,
    description: 'Minimum length for text fields',
    required: false,
  })
  @IsOptional()
  minLength?: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum length for text fields',
    required: false,
  })
  @IsOptional()
  maxLength?: number;

  @ApiProperty({
    example: 0,
    description: 'Minimum value for number fields',
    required: false,
  })
  @IsOptional()
  min?: number;

  @ApiProperty({
    example: 1000,
    description: 'Maximum value for number fields',
    required: false,
  })
  @IsOptional()
  max?: number;

  @ApiProperty({
    example: '^[a-zA-Z]+$',
    description: 'Regex pattern for validation',
    required: false,
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({
    example: 'Please enter a valid value',
    description: 'Custom error message for validation',
    required: false,
  })
  @IsOptional()
  @IsString()
  customErrorMessage?: string;
}

export class FormFieldDto {
  @ApiProperty({
    example: 'firstName',
    description: 'The name of the field',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: 'firstName',
    description: 'The name of the field',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'text',
    description: 'The type of the field',
    enum: ['text', 'textarea', 'number', 'email', 'date', 'checkbox', 'select'],
  })
  @IsString()
  @IsNotEmpty()
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'date'
    | 'checkbox'
    | 'select';

  @ApiProperty({
    example: 'First Name',
    description: 'The display label for the field',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    example: 'Enter your first name',
    description: 'Placeholder text for the field',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the field is required',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({
    example: 'John',
    description: 'Default value for the field',
    required: false,
  })
  @IsOptional()
  defaultValue?: string | number | boolean;

  @ApiProperty({
    example: ['Option 1', 'Option 2', 'Option 3'],
    description: 'Available options for select fields',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({
    description: 'Validation rules for the field',
    type: FormFieldValidationDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormFieldValidationDto)
  validation?: FormFieldValidationDto;
}

export class FormSchemaDto {
  @ApiProperty({
    description: 'Array of form fields',
    type: [FormFieldDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}

export class CreateDocumentTypeDto {
  @ApiProperty({
    example: 'Application Form',
    description: 'The title of the document type',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'application-form',
    description: 'URL-friendly slug for the document type',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'A form for processing applications',
    description: 'Description of the document type',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Form schema with field definitions',
    type: [FormFieldDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[];
}
