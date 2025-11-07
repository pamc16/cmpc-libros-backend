import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Book } from "./models/book.model";
import { Sequelize } from "sequelize-typescript";
import { AuditService } from "../audit/audit.service";
import { Op, OrderItem, WhereOptions } from "sequelize";
import { BookAuthor } from "./models/book-author.model";
import { BookGenre } from "./models/book-genre.model";
import { BookPublisher } from "./models/book-publisher.model";
import { Author } from "./models/author.model";
import { Genre } from "./models/genre.model";
import { Publisher } from "../publishers/publisher.model";

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book) private readonly bookModel: typeof Book,
    @InjectModel(BookAuthor)
    private readonly bookAuthorModel: typeof BookAuthor,
    @InjectModel(BookGenre) private readonly bookGenreModel: typeof BookGenre,
    @InjectModel(BookPublisher)
    private readonly bookPublisherModel: typeof BookPublisher,
    @InjectModel(Author)
    private readonly authorModel: typeof Author,
    @InjectModel(Genre)
    private readonly genreModel: typeof Genre,
    @InjectModel(Publisher)
    private readonly publisherModel: typeof Publisher,
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService
  ) {}

  async create(payload: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const book = await this.bookModel.create(payload as any, {
        transaction: tx,
      });

      await this.bookAuthorModel.bulkCreate(
        (payload.authors || []).map((authorId: string) => ({
          book_id: book.id,
          author_id: authorId,
        })),
        { transaction: tx }
      );
      await this.bookGenreModel.bulkCreate(
        (payload.genres || []).map((genreId: string) => ({
          book_id: book.id,
          genre_id: genreId,
        })),
        { transaction: tx }
      );
      await this.bookPublisherModel.bulkCreate(
        (payload.publishers || []).map((publisherId: string) => ({
          book_id: book.id,
          publisher_id: publisherId,
        })),
        { transaction: tx }
      );
      // await this.auditService.log(
      //   "BOOK.CREATE",
      //   { bookId: book.id, payload },
      //   userId
      // );
      return book;
    });
  }

  async findAll(opts: any = { page: 1, limit: 20, title: undefined }) {
    const where: WhereOptions = {};
    const include: any[] = [];
    const order: OrderItem[] = [];

    // Title filter (ILIKE)
    if (opts.title) {
      where.title = { [Op.iLike]: `%${opts.title}%` };
    }

    // Availability (boolean)
    if (
      typeof opts.availability !== "undefined" &&
      opts.availability !== null
    ) {
      if (typeof opts.availability === "string") {
        if (opts.availability === "true") where.availability = true;
        else if (opts.availability === "false") where.availability = false;
      } else {
        where.availability = !!opts.availability;
      }
    }

    // === Includes para filtros y para devolver datos relacionados ===
    // Genres (many-to-many)
    if (opts.genre) {
      include.push({
        model: this.genreModel,
        as: "genres",
        attributes: ["id", "name"],
        through: { attributes: [] },
        where: { id: String(opts.genre) },
        required: true,
      });
    } else {
      // si no filtras por genre pero quieres que venga en la respuesta
      include.push({
        model: this.genreModel,
        as: "genres",
        attributes: ["id", "name"],
        through: { attributes: [] },
        required: false,
      });
    }

    // Authors (many-to-many)
    if (opts.author) {
      include.push({
        model: this.authorModel,
        as: "authors",
        attributes: ["id", "first_name", "last_name"],
        through: { attributes: [] },
        where: { id: String(opts.author) },
        required: true,
      });
    } else {
      include.push({
        model: this.authorModel,
        as: "authors",
        attributes: ["id", "first_name", "last_name"],
        through: { attributes: [] },
        required: false,
      });
    }

    // Publisher (belongsTo)
    if (opts.publisher) {
      include.push({
        model: this.publisherModel,
        as: "publishers", // usa el alias que definiste en tus asociaciones
        attributes: ["id", "name"],
        where: { id: String(opts.publisher) },
        required: true,
      });
    } else {
      include.push({
        model: this.publisherModel,
        as: "publishers",
        attributes: ["id", "name"],
        required: false,
      });
    }

    // --- Sorting parsing & mapping ---
    const ALLOWED_SORT_FIELDS: Record<string, any> = {
      title: ["title"],
      price: ["price"],
      pages: ["pages"],
      createdAt: ["createdAt"],
      updatedAt: ["updatedAt"],
      availability: ["availability"],
      publisher: [{ model: this.publisherModel, as: "publishers" }, "name"],
      author_first_name: [
        { model: this.authorModel, as: "authors" },
        "first_name",
      ],
      genre: [{ model: this.genreModel, as: "genres" }, "name"],
    };

    const parseSort = (
      s: any
    ): Array<{ field: string; dir: "asc" | "desc" }> => {
      if (!s) return [];
      if (Array.isArray(s)) {
        return s.map((it) => ({
          field: it.field,
          dir: (it.dir || "asc").toLowerCase() === "desc" ? "desc" : "asc",
        }));
      }
      return String(s)
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((part) => {
          const [f, d] = part.split(":").map((x) => x.trim());
          return {
            field: f,
            dir: (d || "asc").toLowerCase() === "desc" ? "desc" : "asc",
          };
        });
    };

    const sortItems = parseSort(opts.sort);

    for (const s of sortItems) {
      const mapped = ALLOWED_SORT_FIELDS[s.field];
      if (!mapped) continue;

      if (Array.isArray(mapped) && typeof mapped[0] === "string") {
        order.push([mapped[0], s.dir.toUpperCase()]);
      } else if (Array.isArray(mapped) && typeof mapped[0] === "object") {
        const assocAs = (mapped[0] as any).as;
        const existing = include.find((inc) => inc.as === assocAs);
        if (!existing) {
          include.push({
            model: (mapped[0] as any).model,
            as: assocAs,
            attributes: [], // si necesitas campos para ordenar, agrega el atributo adecuado
            required: false,
          });
        }
        order.push([mapped[0] as any, mapped[1], s.dir.toUpperCase()]);
      }
    }

    // Pagination
    const limit = Number(opts.limit) || 20;
    const offset = ((Number(opts.page) || 1) - 1) * limit;

    // Ejecuta query con distinct: true para un count correcto
    const result = await this.bookModel.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true,
    });

    return result;
  }

  async findOne(id: string) {
    const book = await this.bookModel.findByPk(id);
    if (!book) throw new NotFoundException();
    return book;
  }

  async update(id: string, payload: any, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      // Obtener instancia del libro
      const book = await this.bookModel.findByPk(id, { transaction: tx });
      if (!book) throw new NotFoundException(`Book with id ${id} not found`);

      // Actualizar campos del libro
      await book.update(payload as any, { transaction: tx });

      // Normalizar arrays de ids a string para evitar problemas (opcional pero recomendado)
      const authorIds: string[] = (payload.authors || []).map((a: any) =>
        String(a)
      );
      const genreIds: string[] = (payload.genres || []).map((g: any) =>
        String(g)
      );
      const publisherIds: string[] = (payload.publishers || []).map((p: any) =>
        String(p)
      );

      // 1) Reemplazar autores
      await this.bookAuthorModel.destroy({
        where: { book_id: book.id },
        transaction: tx,
      });
      if (authorIds.length > 0) {
        await this.bookAuthorModel.bulkCreate(
          authorIds.map((authorId) => ({
            book_id: book.id,
            author_id: authorId,
          })) as any,
          { transaction: tx }
        );
      }

      // 2) Reemplazar géneros
      await this.bookGenreModel.destroy({
        where: { book_id: book.id },
        transaction: tx,
      });
      if (genreIds.length > 0) {
        await this.bookGenreModel.bulkCreate(
          genreIds.map((genreId) => ({
            book_id: book.id,
            genre_id: genreId,
          })) as any,
          { transaction: tx }
        );
      }

      // 3) Reemplazar publishers
      await this.bookPublisherModel.destroy({
        where: { book_id: book.id },
        transaction: tx,
      });
      if (publisherIds.length > 0) {
        await this.bookPublisherModel.bulkCreate(
          publisherIds.map((publisherId) => ({
            book_id: book.id,
            publisher_id: publisherId,
          })) as any,
          { transaction: tx }
        );
      }

      // Audit (opcional)
      await this.auditService.log("BOOK.UPDATE", { bookId: book.id, payload }, userId);

      return book;
    });
  }

  async remove(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      // Buscar libro (paranoid: true por defecto -> no devuelve soft-deleted)
      const book = await this.bookModel.findByPk(id, { transaction: tx });
      if (!book) throw new NotFoundException(`Book with id ${id} not found`);

      // --- 1) Eliminar relaciones en tablas through (para evitar filas huérfanas) ---
      // Ajusta los nombres de las columnas si tus tablas usan otros nombres
      await Promise.all([
        this.bookAuthorModel.destroy({
          where: { book_id: book.id },
          transaction: tx,
        }),
        this.bookGenreModel.destroy({
          where: { book_id: book.id },
          transaction: tx,
        }),
        this.bookPublisherModel.destroy({
          where: { book_id: book.id },
          transaction: tx,
        }),
      ]);

      // --- 2) Soft delete del libro (si tu modelo usa paranoid: true) ---
      await book.destroy({ transaction: tx });

      // --- 3) Audit log ---
      // try {
      //   await this.auditService.log("BOOK.DELETE", { bookId: id }, userId);
      // } catch (auditErr) {
      //   // no queremos fallar la transacción por un error en logging; solo lo registramos
      //   // si prefieres que falle, lanza el error en lugar de solo console.error
      //   // console.error('Audit log failed', auditErr);
      // }

      return { deleted: true };
    });
  }

  async restore(id: string, userId?: string) {
    return this.sequelize.transaction(async (tx) => {
      const book = await this.bookModel.findOne({
        where: { id },
        paranoid: false,
        transaction: tx,
      });
      if (!book) throw new NotFoundException();
      await book.restore({ transaction: tx });
      await this.auditService.log("BOOK.RESTORE", { bookId: id }, userId);
      return book;
    });
  }
}
