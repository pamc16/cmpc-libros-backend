import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { HttpStatus } from '@nestjs/common';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: AuthorsService;

  const mockAuthorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: mockAuthorsService,
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
    service = module.get<AuthorsService>(AuthorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un autor correctamente', async () => {
      const dto = { name: 'Gabriel García Márquez', bio: 'Autor colombiano' };
      const expectedResult = { id: 1, ...dto };
      mockAuthorsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('debe retornar una lista de autores', async () => {
      const mockData = {
        count: 2,
        rows: [
          { id: 1, name: 'Autor 1' },
          { id: 2, name: 'Autor 2' },
        ],
      };
      mockAuthorsService.findAll.mockResolvedValue(mockData);

      const result = await controller.findAll('1', '10', 'test');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'test',
      });
      expect(result).toEqual(mockData);
    });

    it('debe aplicar valores por defecto a page y limit', async () => {
      const mockData = { count: 0, rows: [] };
      mockAuthorsService.findAll.mockResolvedValue(mockData);

      await controller.findAll(undefined, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar un autor por id', async () => {
      const mockAuthor = { id: 1, name: 'Autor 1' };
      mockAuthorsService.findOne.mockResolvedValue(mockAuthor);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('update', () => {
    it('debe actualizar un autor correctamente', async () => {
      const dto = { name: 'Autor actualizado' };
      const mockAuthor = { id: 1, ...dto };
      mockAuthorsService.update.mockResolvedValue(mockAuthor);

      const result = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('remove', () => {
    it('debe eliminar un autor correctamente', async () => {
      mockAuthorsService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual({ deleted: true });
    });
  });
});
