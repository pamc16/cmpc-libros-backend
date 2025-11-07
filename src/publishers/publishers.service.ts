import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Author } from 'src/books/models/author.model';
import { Publisher } from 'src/publishers/publisher.model';

@Injectable()
export class PublisherService {
  constructor(
    @InjectModel(Publisher) // Reemplaza por la clase Publisher si la exportas
    private readonly publisherModel: typeof Publisher,
    private readonly sequelize: Sequelize,
    // private readonly auditService: AuditService,
  ) {}

  async create(payload: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.publisherModel.create(payload as any, { transaction: tx });
      // await this.auditService.log('AUTHOR.CREATE', { authorId: author.id, payload }, userId);
      return author;
    });
  }

  async findAll(opts: any = { page: 1, limit: 20, search: undefined }) {
    const where: any = {};
    if (opts.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${opts.search}%` } },
        { bio: { [Op.iLike]: `%${opts.search}%` } },
      ];
    }
    const limit = Number(opts.limit) || 20;
    const offset = ((Number(opts.page) || 1) - 1) * limit;
    return this.publisherModel.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] });
  }

  async findOne(id: string) {
    const author = await this.publisherModel.findByPk(id);
    if (!author) throw new NotFoundException();
    return author;
  }

  async update(id: string, dto: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.publisherModel.findByPk(id, { transaction: tx });
      if (!author) throw new NotFoundException();
      await author.update(dto as any, { transaction: tx });
      // await this.auditService.log('AUTHOR.UPDATE', { authorId: id, dto }, userId);
      return author;
    });
  }

  async remove(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.publisherModel.findByPk(id, { transaction: tx });
      if (!author) throw new NotFoundException();
      await author.destroy({ transaction: tx });
      // await this.auditService.log('AUTHOR.DELETE', { authorId: id }, userId);
      return { deleted: true };
    });
  }

  async restore(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.publisherModel.findOne({ where: { id }, paranoid: false, transaction: tx });
      if (!author) throw new NotFoundException();
      await author.restore({ transaction: tx });
      // await this.auditService.log('AUTHOR.RESTORE', { authorId: id }, userId);
      return author;
    });
  }
}



