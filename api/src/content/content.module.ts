import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { QueryOptimizationService } from '../common/services/query-optimization.service';
import { QueryCacheService } from '../common/services/query-cache.service';

@Module({
  providers: [ContentService, QueryOptimizationService, QueryCacheService],
  controllers: [ContentController],
  exports: [ContentService, QueryOptimizationService, QueryCacheService],
})
export class ContentModule {}
