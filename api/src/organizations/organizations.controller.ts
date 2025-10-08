import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationsService.create(createOrganizationDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.organizationsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.organizationsService.findOne(
      id,
      req.user.id,
      req.user.role,
      req.user.organizationId,
    );
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Request() req: RequestWithUser) {
    return this.organizationsService.findBySlug(
      slug,
      req.user.id,
      req.user.role,
      req.user.organizationId,
    );
  }

  @Get(':id/users')
  getUsers(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.organizationsService.getUsers(
      id,
      req.user.id,
      req.user.role,
      req.user.organizationId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req: RequestWithUser,
  ) {
    return this.organizationsService.update(
      id,
      updateOrganizationDto,
      req.user.id,
      req.user.role,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.organizationsService.remove(id, req.user.id, req.user.role);
  }
}
