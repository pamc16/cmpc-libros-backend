// src/publishers/publishers.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';

import { PublisherService } from './publishers.service';
import { Publisher } from 'src/publishers/publisher.model';

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

describe('PublisherService', () => {
  let service: PublisherService;
  const publisherModelMock = mockModelFactory();
  const sequelizeMock = mockSequelize();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublisherService,
        { provide: getModelToken(Publisher), useValue: publisherModelMock },
        { provide: Sequelize, useValue: sequelizeMock },
      ],
    }).compile();

    service = module.get<PublisherService>(PublisherService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a publisher inside a transaction and returns it', async () => {
      const payload = { name: 'Casa Editora', bio: '...' };
      const created = { id: 'p1', ...payload };
      (publisherModelMock.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(payload, 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(publisherModelMock.create).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('returns findAndCountAll result with defaults', async () => {
      const fake = { rows: [{ id: 'p1' }], count: 1 };
      (publisherModelMock.findAndCountAll as jest.Mock).mockResolvedValue(fake);

      const res = await service.findAll();
      expect(publisherModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {},
        limit: 20,
        offset: 0,
        order: [['name', 'ASC']],
      }));
      expect(res).toBe(fake);
    });

    it('applies pagination params', async () => {
      (publisherModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await service.findAll({ page: 2, limit: 5 });
      expect(publisherModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 5,
        offset: 5,
      }));
    });

    it('applies search filter using ILIKE on name and bio', async () => {
      (publisherModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await service.findAll({ search: 'search-term' });
      expect(publisherModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          [Op.or]: expect.any(Array),
        }),
      }));
      const calledWhere = (publisherModelMock.findAndCountAll as jest.Mock).mock.calls[0][0].where;
      expect(Array.isArray(calledWhere[Op.or])).toBeTruthy();
    });
  });

  describe('findOne', () => {
    it('returns publisher when found', async () => {
      const p = { id: 'p1', name: 'X' };
      (publisherModelMock.findByPk as jest.Mock).mockResolvedValue(p);
      const res = await service.findOne('p1');
      expect(publisherModelMock.findByPk).toHaveBeenCalledWith('p1');
      expect(res).toBe(p);
    });

    it('throws NotFoundException when not found', async () => {
      (publisherModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('m')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the publisher', async () => {
      const existing: any = { id: 'p1', update: jest.fn().mockResolvedValue(undefined) };
      (publisherModelMock.findByPk as jest.Mock).mockResolvedValue(existing);

      const dto = { name: 'Nuevo' };
      const res = await service.update('p1', dto, 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(publisherModelMock.findByPk).toHaveBeenCalledWith('p1', expect.any(Object));
      expect(existing.update).toHaveBeenCalledWith(dto, expect.any(Object));
      expect(res).toBe(existing);
    });

    it('throws NotFoundException when publisher missing', async () => {
      (publisherModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.update('no', {}, 'u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('destroys relations (if any) and soft-deletes the publisher', async () => {
      const existing: any = { id: 'p1', destroy: jest.fn().mockResolvedValue(undefined) };
      (publisherModelMock.findByPk as jest.Mock).mockResolvedValue(existing);

      const res = await service.remove('p1', 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(publisherModelMock.findByPk).toHaveBeenCalledWith('p1', expect.any(Object));
      expect(existing.destroy).toHaveBeenCalledWith(expect.any(Object));
      expect(res).toEqual({ deleted: true });
    });

    it('throws NotFoundException when missing', async () => {
      (publisherModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('no', 'u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('restores a soft-deleted publisher and returns it', async () => {
      const existing: any = { id: 'p1', restore: jest.fn().mockResolvedValue(undefined) };
      (publisherModelMock.findOne as jest.Mock).mockResolvedValue(existing);

      const res = await service.restore('p1', 'user-1');

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(publisherModelMock.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'p1' },
        paranoid: false,
        transaction: expect.any(Object),
      }));
      expect(existing.restore).toHaveBeenCalledWith(expect.objectContaining({ transaction: expect.any(Object) }));
      expect(res).toBe(existing);
    });

    it('throws NotFoundException when missing', async () => {
      (publisherModelMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.restore('no', 'u')).rejects.toThrow(NotFoundException);
    });
  });
});
