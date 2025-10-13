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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentQueryDto } from './dto/content-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(
    @Body() createContentDto: CreateContentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentService.create(
      createContentDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  findAll(@Query() query: ContentQueryDto, @Request() req: RequestWithUser) {
    return this.contentService.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.contentService.findOne(id, req.user.organizationId);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Request() req: RequestWithUser) {
    return this.contentService.findBySlug(slug, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentService.update(
      id,
      updateContentDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.contentService.publish(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.contentService.remove(id, req.user.organizationId);
  }

  // Optimized query endpoints for large datasets

  @Get('optimized')
  findAllOptimized(
    @Query() query: ContentQueryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentService.findAllOptimized(
      req.user.organizationId,
      query,
      query.limit,
      query.offset,
    );
  }

  @Get('cached')
  findAllCached(
    @Query() query: ContentQueryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentService.findAllCached(
      req.user.organizationId,
      query,
      query.limit,
      query.offset,
    );
  }

  @Get('minimal')
  findAllMinimal(
    @Query() query: ContentQueryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentService.findAllMinimal(
      req.user.organizationId,
      query,
      query.limit,
      query.offset,
    );
  }

  @Get(':id/relations')
  findOneWithRelations(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.contentService.findOneWithRelations(
      id,
      req.user.organizationId,
    );
  }
}
