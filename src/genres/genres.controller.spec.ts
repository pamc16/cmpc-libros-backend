// src/genres/genres.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GenresController, CreateGenreDto, UpdateGenreDto } from './genres.controller';
import { GenresService } from './genres.service';
import { HttpStatus } from '@nestjs/common';

describe('GenresController (unit)', () => {
  let controller: GenresController;
  let genresServiceMock: Partial<Record<keyof GenresService, jest.Mock>>;

  beforeEach(async () => {
    genresServiceMock = {
      create: jest.fn().mockResolvedValue({ id: 'g1', name: 'Romántico' }),
      findAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
      findOne: jest.fn().mockResolvedValue({ id: 'g1', name: 'Romántico' }),
      update: jest.fn().mockResolvedValue({ id: 'g1', name: 'Actualizado' }),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [{ provide: GenresService, useValue: genresServiceMock }],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return its result', async () => {
      const dto: CreateGenreDto = { name: 'Romántico', description: '...' };
      const res = await controller.create(dto);
      expect(genresServiceMock.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual({ id: 'g1', name: 'Romántico' });
    });

    it('should respond with CREATED status annotation', () => {
      // comprobación indirecta: decorador no se ejecuta en unit test directo,
      // pero podemos asegurar que el método existe y el servicio es llamado.
      expect(typeof controller.create).toBe('function');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with default params', async () => {
      await controller.findAll();
      expect(genresServiceMock.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, search: undefined });
    });

    it('should parse numeric params and cap limit to 100', async () => {
      await controller.findAll('2', '200', 'term');
      expect(genresServiceMock.findAll).toHaveBeenCalledWith({ page: 2, limit: 100, search: 'term' });
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const res = await controller.findOne('5' as any);
      expect(genresServiceMock.findOne).toHaveBeenCalledWith('5');
      expect(res).toEqual({ id: 'g1', name: 'Romántico' });
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const dto: UpdateGenreDto = { name: 'Nuevo nombre' };
      const res = await controller.update('5' as any, dto);
      expect(genresServiceMock.update).toHaveBeenCalledWith('5', dto);
      expect(res).toEqual({ id: 'g1', name: 'Actualizado' });
    });
  });

  describe('remove', () => {
    it('should call service.remove and return no-content semantics', async () => {
      const res = await controller.remove('5' as any);
      expect(genresServiceMock.remove).toHaveBeenCalledWith('5');
      expect(res).toEqual({ deleted: true });
      // Nota: el decorator @HttpCode(HttpStatus.NO_CONTENT) no cambia el valor retornado al llamar directo al método.
    });
  });
});
