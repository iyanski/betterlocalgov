import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API response wrapper for all endpoints
 */
export class ApiResponseDto<T = unknown> {
  @ApiProperty({
    description: 'The actual data returned by the endpoint',
  })
  data: T;

  @ApiProperty({
    description: 'Response metadata',
  })
  meta: {
    total?: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };

  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiPropertyOptional({
    example: 'Operation completed successfully',
    description: 'Human-readable message describing the result',
  })
  message?: string;
}

/**
 * Standard API response for error cases
 */
export class ApiErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Human-readable error message',
  })
  message: string;

  @ApiProperty({
    example: 'VALIDATION_ERROR',
    description: 'Error code for programmatic handling',
  })
  errorCode: string;

  @ApiPropertyOptional({
    example: ['Email is required', 'Password must be at least 8 characters'],
    description: 'Detailed error messages',
    type: [String],
  })
  details?: string[];

  @ApiPropertyOptional({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the error occurred',
  })
  timestamp?: string;

  @ApiPropertyOptional({
    example: 'clx1234567890abcdef',
    description: 'Request ID for tracking purposes',
  })
  requestId?: string;
}

/**
 * Standard API response for authentication
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Authentication data',
  })
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      firstName?: string;
      lastName?: string;
      role: string;
      organization: {
        id: string;
        name: string;
        slug: string;
      };
    };
  };

  @ApiProperty({
    description: 'Response metadata',
  })
  meta: {
    total: 1;
    page: 1;
    limit: 1;
    hasMore: false;
  };

  @ApiProperty({
    example: true,
    description: 'Indicates if the authentication was successful',
  })
  success: boolean;

  @ApiPropertyOptional({
    example: 'Authentication successful',
    description: 'Human-readable message',
  })
  message?: string;
}
