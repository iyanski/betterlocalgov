import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { FileValidationService } from '../common/services/file-validation.service';
import { FileSecurityService } from '../common/services/file-security.service';

@Module({
  providers: [MediaService, FileValidationService, FileSecurityService],
  controllers: [MediaController],
  exports: [MediaService, FileValidationService, FileSecurityService],
})
export class MediaModule {}
