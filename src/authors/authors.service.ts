import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Author } from 'src/books/models/author.model';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author) // Reemplaza por la clase Author si la exportas
    private readonly authorModel: typeof Author,
    private readonly sequelize: Sequelize,
    // private readonly auditService: AuditService,
  ) {}

  async create(payload: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.authorModel.create(payload as any, { transaction: tx });
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
    return this.authorModel.findAndCountAll({ where, limit, offset, order: [['first_name', 'ASC']] });
  }

  async findOne(id: string) {
    const author = await this.authorModel.findByPk(id);
    if (!author) throw new NotFoundException();
    return author;
  }

  async update(id: string, dto: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.authorModel.findByPk(id, { transaction: tx });
      if (!author) throw new NotFoundException();
      await author.update(dto as any, { transaction: tx });
      // await this.auditService.log('AUTHOR.UPDATE', { authorId: id, dto }, userId);
      return author;
    });
  }

  async remove(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.authorModel.findByPk(id, { transaction: tx });
      if (!author) throw new NotFoundException();
      await author.destroy({ transaction: tx });
      // await this.auditService.log('AUTHOR.DELETE', { authorId: id }, userId);
      return { deleted: true };
    });
  }

  async restore(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const author = await this.authorModel.findOne({ where: { id }, paranoid: false, transaction: tx });
      if (!author) throw new NotFoundException();
      await author.restore({ transaction: tx });
      // await this.auditService.log('AUTHOR.RESTORE', { authorId: id }, userId);
      return author;
    });
  }
}



