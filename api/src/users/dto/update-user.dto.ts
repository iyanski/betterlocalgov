import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsPasswordComplex } from '../../common/decorators/password-complexity.decorator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'updated.john.doe@example.com',
    description: 'Updated email address of the user',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'updatedjohndoe',
    description: 'Updated username of the user',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePass123!',
    description:
      'Updated password for the user account (must contain uppercase, lowercase, numbers, and special characters)',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @IsPasswordComplex({
    message:
      'Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters. It should not contain personal information or common patterns.',
  })
  password?: string;

  @ApiPropertyOptional({
    example: 'Updated John',
    description: 'Updated first name of the user',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Updated Doe',
    description: 'Updated last name of the user',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.EDITOR,
    description: 'Updated role of the user in the organization',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: 'clx1234567890abcdef',
    description: 'Updated organization ID for the user',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  organizationId?: string;
}
