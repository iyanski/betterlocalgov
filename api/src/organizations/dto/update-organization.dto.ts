import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    example: 'Updated Acme Corporation',
    description: 'The updated name of the organization',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'updated-acme-corp',
    description: 'Updated URL-friendly slug for the organization',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    example: 'An updated leading technology company',
    description: 'Updated description of the organization',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'updated-acme.com',
    description: 'Updated domain associated with the organization',
  })
  @IsOptional()
  @IsUrl()
  domain?: string;
}
