import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the user',
  })
  id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username of the user',
  })
  username: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'First name of the user',
  })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name of the user',
  })
  lastName?: string;

  @ApiProperty({
    example: 'EDITOR',
    description: 'Role of the user in the organization',
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization the user belongs to',
  })
  organizationId: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the user was last updated',
  })
  updatedAt: Date;
}

export class UserListResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Array of users',
  })
  users: UserResponseDto[];

  @ApiProperty({
    example: 10,
    description: 'Total number of users',
  })
  total: number;
}

export class UserDeleteResponseDto {
  @ApiProperty({
    example: 'User deleted successfully',
    description: 'Success message',
  })
  message: string;
}
