// src/books/books.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException } from '@nestjs/common';

import { BooksService } from './books.service';
import { Book } from './models/book.model';
import { BookAuthor } from './models/book-author.model';
import { BookGenre } from './models/book-genre.model';
import { BookPublisher } from './models/book-publisher.model';
import { Author } from './models/author.model';
import { Genre } from './models/genre.model';
import { Publisher } from '../publishers/publisher.model';
import { AuditService } from '../audit/audit.service';

type MockModel = {
  create?: jest.Mock;
  findByPk?: jest.Mock;
  findOne?: jest.Mock;
  findAndCountAll?: jest.Mock;
  update?: jest.Mock;
  destroy?: jest.Mock;
  bulkCreate?: jest.Mock;
  restore?: jest.Mock;
};

const mockModelFactory = (): MockModel => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn(),
  restore: jest.fn(),
});

const mockSequelize = () => ({
  transaction: jest.fn().mockImplementation(async (cb: any) => {
    // call callback with a fake tx object
    return await cb({} as any);
  }),
});

describe('BooksService (unit)', () => {
  let service: BooksService;

  // model mocks
  const bookModelMock = mockModelFactory();
  const bookAuthorModelMock = mockModelFactory();
  const bookGenreModelMock = mockModelFactory();
  const bookPublisherModelMock = mockModelFactory();
  const authorModelMock = mockModelFactory();
  const genreModelMock = mockModelFactory();
  const publisherModelMock = mockModelFactory();

  const auditServiceMock = {
    log: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book), useValue: bookModelMock },
        { provide: getModelToken(BookAuthor), useValue: bookAuthorModelMock },
        { provide: getModelToken(BookGenre), useValue: bookGenreModelMock },
        { provide: getModelToken(BookPublisher), useValue: bookPublisherModelMock },
        { provide: getModelToken(Author), useValue: authorModelMock },
        { provide: getModelToken(Genre), useValue: genreModelMock },
        { provide: getModelToken(Publisher), useValue: publisherModelMock },
        { provide: Sequelize, useValue: mockSequelize() },
        { provide: AuditService, useValue: auditServiceMock },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);

    // reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a book and relation rows', async () => {
      const payload = { title: 'X', authors: ['a1'], genres: ['g1'], publishers: ['p1'] };
      const createdBook = { id: 'book-1', title: 'X' };
      (bookModelMock.create as jest.Mock).mockResolvedValue(createdBook);
      (bookAuthorModelMock.bulkCreate as jest.Mock).mockResolvedValue([]);
      (bookGenreModelMock.bulkCreate as jest.Mock).mockResolvedValue([]);
      (bookPublisherModelMock.bulkCreate as jest.Mock).mockResolvedValue([]);

      const res = await service.create(payload, 'user-1');

      expect(bookModelMock.create).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(bookAuthorModelMock.bulkCreate).toHaveBeenCalledWith(
        [{ book_id: 'book-1', author_id: 'a1' }],
        expect.any(Object),
      );
      expect(bookGenreModelMock.bulkCreate).toHaveBeenCalledWith(
        [{ book_id: 'book-1', genre_id: 'g1' }],
        expect.any(Object),
      );
      expect(bookPublisherModelMock.bulkCreate).toHaveBeenCalledWith(
        [{ book_id: 'book-1', publisher_id: 'p1' }],
        expect.any(Object),
      );
      expect(res).toBe(createdBook);
    });
  });

  describe('findAll', () => {
    it('calls findAndCountAll with title filter and pagination', async () => {
      const fakeResult = { rows: [{ id: '1' }], count: 1 };
      (bookModelMock.findAndCountAll as jest.Mock).mockResolvedValue(fakeResult);

      const res = await service.findAll({ page: 2, limit: 5, title: 'abc' });

      expect(bookModelMock.findAndCountAll).toHaveBeenCalled();
      // verify result forwarded
      expect(res).toBe(fakeResult);
    });

    it('coerces availability strings', async () => {
      (bookModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await expect(service.findAll({ availability: 'true' })).resolves.toBeDefined();
      await expect(service.findAll({ availability: 'false' })).resolves.toBeDefined();
    });

    it('adds includes for author/genre/publisher filters', async () => {
      (bookModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await service.findAll({ author: 'a1', genre: 'g1', publisher: 'p1' });
      expect(bookModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'genres' }),
          expect.objectContaining({ as: 'authors' }),
          expect.objectContaining({ as: 'publishers' }),
        ]),
      }));
    });

    it('supports sorting by publisher name', async () => {
      (bookModelMock.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });
      await service.findAll({ sort: 'publisher:asc' });
      expect(bookModelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        order: expect.any(Array),
      }));
    });
  });

  describe('findOne', () => {
    it('returns book when found', async () => {
      const book = { id: 'b1', title: 'T' };
      (bookModelMock.findByPk as jest.Mock).mockResolvedValue(book);
      const res = await service.findOne('b1');
      expect(res).toBe(book);
      expect(bookModelMock.findByPk).toHaveBeenCalledWith('b1');
    });

    it('throws NotFoundException when not found', async () => {
      (bookModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates book and replaces relations', async () => {
      const existingBook: any = {
        id: 'b1',
        update: jest.fn().mockResolvedValue(undefined),
      };
      (bookModelMock.findByPk as jest.Mock).mockResolvedValue(existingBook);
      (bookAuthorModelMock.destroy as jest.Mock).mockResolvedValue(1);
      (bookAuthorModelMock.bulkCreate as jest.Mock).mockResolvedValue([]);
      (bookGenreModelMock.destroy as jest.Mock).mockResolvedValue(1);
      (bookGenreModelMock.bulkCreate as jest.Mock).mockResolvedValue([]);
      (bookPublisherModelMock.destroy as jest.Mock).mockResolvedValue(1);
      (bookPublisherModelMock.bulkCreate as jest.Mock).mockResolvedValue([]);

      const payload = { title: 'Updated', authors: ['a2'], genres: ['g2'], publishers: ['p2'] };
      const res = await service.update('b1', payload, 'user-1');

      // verify find and update called
      expect(bookModelMock.findByPk).toHaveBeenCalledWith('b1', expect.any(Object));
      expect(existingBook.update).toHaveBeenCalledWith(payload as any, expect.any(Object));

      // verify relations removed & reinserted
      expect(bookAuthorModelMock.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { book_id: 'b1' }, transaction: expect.any(Object) }));
      expect(bookAuthorModelMock.bulkCreate).toHaveBeenCalledWith([{ book_id: 'b1', author_id: 'a2' }], expect.any(Object));

      expect(bookGenreModelMock.destroy).toHaveBeenCalled();
      expect(bookGenreModelMock.bulkCreate).toHaveBeenCalled();

      expect(bookPublisherModelMock.destroy).toHaveBeenCalled();
      expect(bookPublisherModelMock.bulkCreate).toHaveBeenCalled();

      // should return the book instance
      expect(res).toBe(existingBook);
    });

    it('throws NotFoundException if book missing', async () => {
      (bookModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.update('no', {}, 'u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft deletes book and destroys relations', async () => {
      const bookInstance: any = {
        id: 'b1',
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      (bookModelMock.findByPk as jest.Mock).mockResolvedValue(bookInstance);
      (bookAuthorModelMock.destroy as jest.Mock).mockResolvedValue(1);
      (bookGenreModelMock.destroy as jest.Mock).mockResolvedValue(1);
      (bookPublisherModelMock.destroy as jest.Mock).mockResolvedValue(1);

      const res = await service.remove('b1', 'user-1');

      expect(bookModelMock.findByPk).toHaveBeenCalledWith('b1', expect.any(Object));
      expect(bookAuthorModelMock.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { book_id: 'b1' }, transaction: expect.any(Object) }));
      expect(bookGenreModelMock.destroy).toHaveBeenCalled();
      expect(bookPublisherModelMock.destroy).toHaveBeenCalled();
      expect(bookInstance.destroy).toHaveBeenCalledWith(expect.objectContaining({ transaction: expect.any(Object) }));
      expect(res).toEqual({ deleted: true });
    });

    it('throws NotFoundException if not found', async () => {
      (bookModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('missing', 'u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('restores a soft-deleted book and logs audit', async () => {
      const bookInstance: any = {
        id: 'b1',
        restore: jest.fn().mockResolvedValue(undefined),
      };
      (bookModelMock.findOne as jest.Mock).mockResolvedValue(bookInstance);
      (auditServiceMock.log as jest.Mock).mockResolvedValue(null);

      const res = await service.restore('b1', 'user-1');

      expect(bookModelMock.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'b1' }, paranoid: false, transaction: expect.any(Object) }));
      expect(bookInstance.restore).toHaveBeenCalledWith(expect.objectContaining({ transaction: expect.any(Object) }));
      expect(auditServiceMock.log).toHaveBeenCalledWith('BOOK.RESTORE', { bookId: 'b1' }, 'user-1');
      expect(res).toBe(bookInstance);
    });

    it('throws NotFoundException if not found', async () => {
      (bookModelMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.restore('missing', 'u')).rejects.toThrow(NotFoundException);
    });
  });
});
