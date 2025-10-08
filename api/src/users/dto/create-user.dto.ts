import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsPasswordComplex } from '../../common/decorators/password-complexity.decorator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username of the user',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password for the user account (must contain uppercase, lowercase, numbers, and special characters)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @IsPasswordComplex({
    message:
      'Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters. It should not contain personal information or common patterns.',
  })
  password: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'First name of the user',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name of the user',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.EDITOR,
    description: 'Role of the user in the organization',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization the user belongs to',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  organizationId: string;
}
