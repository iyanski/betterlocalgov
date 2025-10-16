import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypesService } from './document-types.service';

describe('DocumentTypesService', () => {
  let service: DocumentTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentTypesService],
    }).compile();

    service = module.get<DocumentTypesService>(DocumentTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
