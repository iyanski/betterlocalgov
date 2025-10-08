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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagContentQueryDto } from './dto/tag-content-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto, @Request() req: RequestWithUser) {
    return this.tagsService.create(
      createTagDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Request() req: RequestWithUser) {
    return this.tagsService.findBySlug(slug, req.user.organizationId);
  }

  @Get(':id/content')
  getContentByTag(@Param('id') id: string, @Query() query: TagContentQueryDto) {
    return this.tagsService.getContentByTag(id, query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() req: RequestWithUser,
  ) {
    return this.tagsService.update(id, updateTagDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
