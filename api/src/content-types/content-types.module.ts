import { Module } from '@nestjs/common';
import { ContentTypesService } from './content-types.service';
import { ContentTypesController } from './content-types.controller';

@Module({
  providers: [ContentTypesService],
  controllers: [ContentTypesController],
  exports: [ContentTypesService],
})
export class ContentTypesModule {}
