import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the organization',
  })
  id: string;

  @ApiProperty({
    example: 'Acme Corporation',
    description: 'The name of the organization',
  })
  name: string;

  @ApiProperty({
    example: 'acme-corp',
    description: 'URL-friendly slug for the organization',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'A leading technology company',
    description: 'Description of the organization',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'acme.com',
    description: 'Domain associated with the organization',
  })
  domain?: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who created this organization',
  })
  createdBy: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the organization was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the organization was last updated',
  })
  updatedAt: Date;
}

export class OrganizationListResponseDto {
  @ApiProperty({
    type: [OrganizationResponseDto],
    description: 'Array of organizations',
  })
  organizations: OrganizationResponseDto[];

  @ApiProperty({
    example: 10,
    description: 'Total number of organizations',
  })
  total: number;
}

export class OrganizationDeleteResponseDto {
  @ApiProperty({
    example: 'Organization deleted successfully',
    description: 'Success message',
  })
  message: string;
}

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

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: 'OWNER',
    description: 'Role of the user in the organization',
    enum: ['OWNER', 'EDITOR', 'VIEWER'],
  })
  role: string;

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

export class OrganizationUsersResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Array of users in the organization',
  })
  users: UserResponseDto[];

  @ApiProperty({
    example: 5,
    description: 'Total number of users in the organization',
  })
  total: number;
}
