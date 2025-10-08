import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsHexColor,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({
    example: 'Updated JavaScript',
    description: 'The updated name of the tag',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    example: 'updated-javascript',
    description: 'Updated URL-friendly slug for the tag',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Updated JavaScript related content',
    description: 'Updated description of the tag',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({
    example: '#FF6B35',
    description: 'Updated hex color code for the tag',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
