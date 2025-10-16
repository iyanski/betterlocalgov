import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DocumentTypesService } from './document-types.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

@ApiTags('Document Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-types')
export class DocumentTypesController {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document type' })
  @ApiResponse({
    status: 201,
    description: 'Document type created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Document type with this title or slug already exists',
  })
  create(
    @Body() createDocumentTypeDto: CreateDocumentTypeDto,
    @Request() req: RequestWithUser,
  ) {
    return this.documentTypesService.create(
      createDocumentTypeDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all document types with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for title, description, or slug',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Document types retrieved successfully',
  })
  findAll(
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.documentTypesService.findAll(
      req.user.organizationId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document type by ID' })
  @ApiParam({ name: 'id', description: 'Document type ID' })
  @ApiResponse({
    status: 200,
    description: 'Document type retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.documentTypesService.findOne(id, req.user.organizationId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a document type by slug (public access)' })
  @ApiParam({ name: 'slug', description: 'Document type slug' })
  @ApiResponse({
    status: 200,
    description: 'Document type retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  findBySlug(@Param('slug') slug: string, @Request() req: RequestWithUser) {
    return this.documentTypesService.findBySlug(slug, req.user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document type' })
  @ApiParam({ name: 'id', description: 'Document type ID' })
  @ApiResponse({
    status: 200,
    description: 'Document type updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({
    status: 409,
    description: 'Document type with this title or slug already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateDocumentTypeDto: UpdateDocumentTypeDto,
    @Request() req: RequestWithUser,
  ) {
    return this.documentTypesService.update(
      id,
      updateDocumentTypeDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document type' })
  @ApiParam({ name: 'id', description: 'Document type ID' })
  @ApiResponse({
    status: 204,
    description: 'Document type deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete document type with associated documents',
  })
  deactivate(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.documentTypesService.deactivate(id, req.user.organizationId);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a document type' })
  @ApiParam({ name: 'id', description: 'Document type ID' })
  @ApiResponse({
    status: 200,
    description: 'Document type status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  toggleActive(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.documentTypesService.toggleActive(
      id,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get all documents of a specific document type' })
  @ApiParam({ name: 'id', description: 'Document type ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Document type not found' })
  getDocumentsByType(
    @Param('id') documentTypeId: string,
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.documentTypesService.getDocumentsByType(
      documentTypeId,
      req.user.organizationId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
