import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the media',
  })
  id: string;

  @ApiProperty({
    example: 'sunset.jpg',
    description: 'Original filename of the uploaded file',
  })
  filename: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the file',
  })
  mimeType: string;

  @ApiProperty({
    example: 1024000,
    description: 'Size of the file in bytes',
  })
  size: number;

  @ApiProperty({
    example: '/uploads/sunset.jpg',
    description: 'URL path to the uploaded file',
  })
  url: string;

  @ApiPropertyOptional({
    example: 'A beautiful sunset',
    description: 'Alternative text for the media',
  })
  alt?: string;

  @ApiPropertyOptional({
    example: 'Sunset over the mountains',
    description: 'Caption for the media',
  })
  caption?: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this media',
  })
  organizationId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who uploaded this media',
  })
  uploadedBy: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the media was uploaded',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the media was last updated',
  })
  updatedAt: Date;
}

export class MediaListResponseDto {
  @ApiProperty({
    type: [MediaResponseDto],
    description: 'Array of media items',
  })
  data: MediaResponseDto[];

  @ApiProperty({
    example: 25,
    description: 'Total number of media items',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 3,
    description: 'Total number of pages',
  })
  totalPages: number;
}

export class MediaDeleteResponseDto {
  @ApiProperty({
    example: 'Media deleted successfully',
    description: 'Success message',
  })
  message: string;
}

export class MediaUploadResponseDto {
  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'Unique identifier for the uploaded media',
  })
  id: string;

  @ApiProperty({
    example: 'sunset.jpg',
    description: 'Original filename of the uploaded file',
  })
  filename: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the file',
  })
  mimeType: string;

  @ApiProperty({
    example: 1024000,
    description: 'Size of the file in bytes',
  })
  size: number;

  @ApiProperty({
    example: '/uploads/sunset.jpg',
    description: 'URL path to the uploaded file',
  })
  url: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the organization that owns this media',
  })
  organizationId: string;

  @ApiProperty({
    example: 'clx1234567890abcdef',
    description: 'ID of the user who uploaded this media',
  })
  uploadedBy: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date and time when the media was uploaded',
  })
  createdAt: Date;
}
