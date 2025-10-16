import { PartialType } from '@nestjs/swagger';
import { CreateDocumentTypeDto } from './create-document-type.dto';

export class UpdateDocumentTypeDto extends PartialType(CreateDocumentTypeDto) {}
