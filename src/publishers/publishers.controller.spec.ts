// src/publishers/publishers.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PublishersController } from './publishers.controller';
import { PublisherService } from './publishers.service';

describe('PublishersController', () => {
  let controller: PublishersController;
  let publisherServiceMock: Partial<Record<keyof PublisherService, jest.Mock>>;

  beforeEach(async () => {
    publisherServiceMock = {
      findAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'P' }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishersController],
      providers: [{ provide: PublisherService, useValue: publisherServiceMock }],
    }).compile();

    controller = module.get<PublishersController>(PublishersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll - should call service with default params', async () => {
    await controller.findAll(); // uses defaults page='1', limit='10', search=undefined
    expect(publisherServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(publisherServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: undefined,
    });
  });

  it('findAll - should parse and forward custom params', async () => {
    await controller.findAll('2', '5', 'search-term');
    expect(publisherServiceMock.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      search: 'search-term',
    });
  });

  it('findAll - should cap limit to 100 when large value provided', async () => {
    await controller.findAll('1', '1000', undefined);
    expect(publisherServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 100,
      search: undefined,
    });
  });

  it('findOne - should call service.findOne with provided id', async () => {
    // Note: ParseIntPipe is applied by Nest at the routing level. Here we call controller method directly.
    await controller.findOne('7' as any);
    expect(publisherServiceMock.findOne).toHaveBeenCalledTimes(1);
    expect(publisherServiceMock.findOne).toHaveBeenCalledWith('7');
  });
});
