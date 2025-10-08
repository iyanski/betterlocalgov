import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsHexColor,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'JavaScript',
    description: 'The name of the tag',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'javascript',
    description: 'URL-friendly slug for the tag',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  slug: string;

  @ApiPropertyOptional({
    example: 'JavaScript related content',
    description: 'Description of the tag',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({
    example: '#F7DF1E',
    description: 'Hex color code for the tag',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
