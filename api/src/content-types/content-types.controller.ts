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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentTypesService } from './content-types.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

@ApiTags('Content Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content-types')
export class ContentTypesController {
  constructor(private readonly contentTypesService: ContentTypesService) {}

  @Post()
  create(
    @Body() createContentTypeDto: CreateContentTypeDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentTypesService.create(
      createContentTypeDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  findAll() {
    return this.contentTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentTypesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Request() req: RequestWithUser) {
    return this.contentTypesService.findBySlug(slug, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentTypeDto: UpdateContentTypeDto,
    @Request() req: RequestWithUser,
  ) {
    return this.contentTypesService.update(
      id,
      updateContentTypeDto,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentTypesService.remove(id);
  }
}
