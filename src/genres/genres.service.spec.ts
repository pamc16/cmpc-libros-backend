// src/genres/genres.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';

import { GenresService } from './genres.service';
import { Genre } from 'src/books/models/genre.model'; // ajusta si tu path es distinto

type MockModel = {
  create?: jest.Mock;
  findAndCountAll?: jest.Mock;
  findByPk?: jest.Mock;
  findOne?: jest.Mock;
};

const mockModelFactory = (): MockModel => ({
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
});

const mockSequelize = () => ({
  transaction: jest.fn().mockImplementation(async (cb: any) => {
    // ejecutar callback con tx falso
    return await cb({} as any);
  }),
});

describe('GenresService (unit)', () => {
  let service: GenresService;
  const genreModelMock = mockModelFactory();
  const sequelizeMock = mockSequelize();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getModelToken(Genre), useValue: genreModelMock },
        { provide: Sequelize, useValue: sequelizeMock },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a genre inside a transaction and returns it', async () => {
      const payload = { name: 'Romántico' };
      const created = { id: 'g1', ...payload };
      (genreModelMock.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(payload, 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(genreModelMock.create).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('returns findAndCountAll result with defaults', async () => {
      const fake = { rows: [{ id: 'g1' }], count: 1 };
      (genreModelMock.findAndCountAll as jest.Mock).mockResolvedValue(fake);

      const res = await service.findAll();
      expect(genreModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {},
        limit: 20,
        offset: 0,
        order: [['name', 'ASC']],
      }));
      expect(res).toBe(fake);
    });

    it('applies pagination params', async () => {
      (genreModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await service.findAll({ page: 2, limit: 5 });
      expect(genreModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 5,
        offset: 5,
      }));
    });

    it('applies search filter using ILIKE on name', async () => {
      (genreModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await service.findAll({ search: 'rom' });
      expect(genreModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ [Op.iLike]: expect.any(String) }),
        }),
      }));
      const calledWhere = (genreModelMock.findAndCountAll as jest.Mock).mock.calls[0][0].where;
      expect(calledWhere.name[Op.iLike]).toContain('rom');
    });
  });

  describe('findOne', () => {
    it('returns genre when found', async () => {
      const g = { id: 'g1', name: 'X' };
      (genreModelMock.findByPk as jest.Mock).mockResolvedValue(g);
      const res = await service.findOne('g1');
      expect(genreModelMock.findByPk).toHaveBeenCalledWith('g1');
      expect(res).toBe(g);
    });

    it('throws NotFoundException when not found', async () => {
      (genreModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the genre', async () => {
      const existing: any = { id: 'g1', update: jest.fn().mockResolvedValue(undefined) };
      (genreModelMock.findByPk as jest.Mock).mockResolvedValue(existing);

      const dto = { name: 'Nuevo' };
      const res = await service.update('g1', dto, 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(genreModelMock.findByPk).toHaveBeenCalledWith('g1', expect.any(Object));
      expect(existing.update).toHaveBeenCalledWith(dto, expect.any(Object));
      expect(res).toBe(existing);
    });

    it('throws NotFoundException when genre missing', async () => {
      (genreModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.update('no', {}, 'u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('destroys and returns deleted flag', async () => {
      const existing: any = { id: 'g1', destroy: jest.fn().mockResolvedValue(undefined) };
      (genreModelMock.findByPk as jest.Mock).mockResolvedValue(existing);

      const res = await service.remove('g1', 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(genreModelMock.findByPk).toHaveBeenCalledWith('g1', expect.any(Object));
      expect(existing.destroy).toHaveBeenCalledWith(expect.any(Object));
      expect(res).toEqual({ deleted: true });
    });

    it('throws NotFoundException when missing', async () => {
      (genreModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('no', 'u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('restores a soft-deleted genre and returns it', async () => {
      const existing: any = { id: 'g1', restore: jest.fn().mockResolvedValue(undefined) };
      (genreModelMock.findOne as jest.Mock).mockResolvedValue(existing);

      const res = await service.restore('g1', 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(genreModelMock.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'g1' },
        paranoid: false,
        transaction: expect.any(Object),
      }));
      expect(existing.restore).toHaveBeenCalledWith(expect.objectContaining({ transaction: expect.any(Object) }));
      expect(res).toBe(existing);
    });

    it('throws NotFoundException when missing', async () => {
      (genreModelMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.restore('no', 'u')).rejects.toThrow(NotFoundException);
    });
  });
});
