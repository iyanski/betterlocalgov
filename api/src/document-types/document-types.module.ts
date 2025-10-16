import { Module } from '@nestjs/common';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypesController } from './document-types.controller';

@Module({
  providers: [DocumentTypesService],
  controllers: [DocumentTypesController],
})
export class DocumentTypesModule {}
