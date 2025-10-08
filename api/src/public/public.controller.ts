import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { PublicContentQueryDto } from './dto/public-content-query.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('content')
  async findAll(@Query() query: PublicContentQueryDto) {
    return this.publicService.findAll(query);
  }

  @Get('content/:id')
  async findOne(
    @Param('id') id: string,
    @Query('organizationSlug') organizationSlug: string,
  ) {
    const content = await this.publicService.findOne(id, organizationSlug);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    return content;
  }

  @Get('content/slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('organizationSlug') organizationSlug: string,
  ) {
    const content = await this.publicService.findBySlug(slug, organizationSlug);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    return content;
  }

  @Get('categories')
  async getCategories(@Query('organizationSlug') organizationSlug: string) {
    return this.publicService.getCategories(organizationSlug);
  }

  @Get('tags')
  async getTags(@Query('organizationSlug') organizationSlug: string) {
    return this.publicService.getTags(organizationSlug);
  }

  @Get('content-types')
  async getContentTypes(@Query('organizationSlug') organizationSlug: string) {
    return this.publicService.getContentTypes(organizationSlug);
  }
}
