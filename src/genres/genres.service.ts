import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Genre } from "src/books/models/genre.model";
import { Sequelize } from "sequelize-typescript";

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre) // Reemplaza por la clase Genre si la exportas
    private readonly genreModel: typeof Genre,
    private readonly sequelize: Sequelize
  ) // private readonly auditService: AuditService,
  {}

  async create(payload: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const genre = await this.genreModel.create(payload as any, {
        transaction: tx,
      });
      // await this.auditService.log('GENRE.CREATE', { genreId: genre.id, payload }, userId);
      return genre;
    });
  }

  async findAll(opts: any = { page: 1, limit: 20, search: undefined }) {
    const where: any = {};
    if (opts.search) {
      where.name = { [Op.iLike]: `%${opts.search}%` };
    }
    const limit = Number(opts.limit) || 20;
    const offset = ((Number(opts.page) || 1) - 1) * limit;
    return this.genreModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [["name", "ASC"]],
    });
  }

  async findOne(id: string) {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) throw new NotFoundException();
    return genre;
  }

  async update(id: string, dto: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const genre = await this.genreModel.findByPk(id, { transaction: tx });
      if (!genre) throw new NotFoundException();
      await genre.update(dto as any, { transaction: tx });
      // await this.auditService.log('GENRE.UPDATE', { genreId: id, dto }, userId);
      return genre;
    });
  }

  async remove(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const genre = await this.genreModel.findByPk(id, { transaction: tx });
      if (!genre) throw new NotFoundException();
      await genre.destroy({ transaction: tx });
      // await this.auditService.log('GENRE.DELETE', { genreId: id }, userId);
      return { deleted: true };
    });
  }

  async restore(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const genre = await this.genreModel.findOne({
        where: { id },
        paranoid: false,
        transaction: tx,
      });
      if (!genre) throw new NotFoundException();
      await genre.restore({ transaction: tx });
      // await this.auditService.log('GENRE.RESTORE', { genreId: id }, userId);
      return genre;
    });
  }
}
