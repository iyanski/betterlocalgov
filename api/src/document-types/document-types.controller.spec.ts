import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypesController } from './document-types.controller';

describe('DocumentTypesController', () => {
  let controller: DocumentTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentTypesController],
    }).compile();

    controller = module.get<DocumentTypesController>(DocumentTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
