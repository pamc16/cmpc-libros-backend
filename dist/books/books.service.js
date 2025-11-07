"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const book_model_1 = require("./models/book.model");
const sequelize_typescript_1 = require("sequelize-typescript");
const audit_service_1 = require("../audit/audit.service");
const sequelize_2 = require("sequelize");
const book_author_model_1 = require("./models/book-author.model");
const book_genre_model_1 = require("./models/book-genre.model");
const book_publisher_model_1 = require("./models/book-publisher.model");
const author_model_1 = require("./models/author.model");
const genre_model_1 = require("./models/genre.model");
const publisher_model_1 = require("./models/publisher.model");
let BooksService = class BooksService {
    constructor(bookModel, bookAuthorModel, bookGenreModel, bookPublisherModel, authorModel, genreModel, publisherModel, sequelize, auditService) {
        this.bookModel = bookModel;
        this.bookAuthorModel = bookAuthorModel;
        this.bookGenreModel = bookGenreModel;
        this.bookPublisherModel = bookPublisherModel;
        this.authorModel = authorModel;
        this.genreModel = genreModel;
        this.publisherModel = publisherModel;
        this.sequelize = sequelize;
        this.auditService = auditService;
    }
    async create(payload, userId) {
        return this.sequelize.transaction(async (tx) => {
            const book = await this.bookModel.create(payload, {
                transaction: tx,
            });
            await this.bookAuthorModel.bulkCreate((payload.authors || []).map((authorId) => ({
                book_id: book.id,
                author_id: authorId,
            })), { transaction: tx });
            await this.bookGenreModel.bulkCreate((payload.genres || []).map((genreId) => ({
                book_id: book.id,
                genre_id: genreId,
            })), { transaction: tx });
            await this.bookPublisherModel.bulkCreate((payload.publishers || []).map((publisherId) => ({
                book_id: book.id,
                publisher_id: publisherId,
            })), { transaction: tx });
            return book;
        });
    }
    async findAll(opts = { page: 1, limit: 20, title: undefined }) {
        const where = {};
        const include = [];
        const order = [];
        if (opts.title) {
            where.title = { [sequelize_2.Op.iLike]: `%${opts.title}%` };
        }
        if (typeof opts.availability !== "undefined" &&
            opts.availability !== null) {
            if (typeof opts.availability === "string") {
                if (opts.availability === "true")
                    where.availability = true;
                else if (opts.availability === "false")
                    where.availability = false;
            }
            else {
                where.availability = !!opts.availability;
            }
        }
        if (opts.genre) {
            include.push({
                model: this.genreModel,
                as: "genres",
                attributes: ["id", "name"],
                through: { attributes: [] },
                where: { id: String(opts.genre) },
                required: true,
            });
        }
        else {
            include.push({
                model: this.genreModel,
                as: "genres",
                attributes: ["id", "name"],
                through: { attributes: [] },
                required: false,
            });
        }
        if (opts.author) {
            include.push({
                model: this.authorModel,
                as: "authors",
                attributes: ["id", "first_name", "last_name"],
                through: { attributes: [] },
                where: { id: String(opts.author) },
                required: true,
            });
        }
        else {
            include.push({
                model: this.authorModel,
                as: "authors",
                attributes: ["id", "first_name", "last_name"],
                through: { attributes: [] },
                required: false,
            });
        }
        if (opts.publisher) {
            include.push({
                model: this.publisherModel,
                as: "publishers",
                attributes: ["id", "name"],
                where: { id: String(opts.publisher) },
                required: true,
            });
        }
        else {
            include.push({
                model: this.publisherModel,
                as: "publishers",
                attributes: ["id", "name"],
                required: false,
            });
        }
        const ALLOWED_SORT_FIELDS = {
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
        const parseSort = (s) => {
            if (!s)
                return [];
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
            if (!mapped)
                continue;
            if (Array.isArray(mapped) && typeof mapped[0] === "string") {
                order.push([mapped[0], s.dir.toUpperCase()]);
            }
            else if (Array.isArray(mapped) && typeof mapped[0] === "object") {
                const assocAs = mapped[0].as;
                const existing = include.find((inc) => inc.as === assocAs);
                if (!existing) {
                    include.push({
                        model: mapped[0].model,
                        as: assocAs,
                        attributes: [],
                        required: false,
                    });
                }
                order.push([mapped[0], mapped[1], s.dir.toUpperCase()]);
            }
        }
        const limit = Number(opts.limit) || 20;
        const offset = ((Number(opts.page) || 1) - 1) * limit;
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
    async findOne(id) {
        const book = await this.bookModel.findByPk(id);
        if (!book)
            throw new common_1.NotFoundException();
        return book;
    }
    async update(id, payload, userId) {
        return this.sequelize.transaction(async (tx) => {
            const book = await this.bookModel.findByPk(id, { transaction: tx });
            if (!book)
                throw new common_1.NotFoundException(`Book with id ${id} not found`);
            await book.update(payload, { transaction: tx });
            const authorIds = (payload.authors || []).map((a) => String(a));
            const genreIds = (payload.genres || []).map((g) => String(g));
            const publisherIds = (payload.publishers || []).map((p) => String(p));
            await this.bookAuthorModel.destroy({
                where: { book_id: book.id },
                transaction: tx,
            });
            if (authorIds.length > 0) {
                await this.bookAuthorModel.bulkCreate(authorIds.map((authorId) => ({
                    book_id: book.id,
                    author_id: authorId,
                })), { transaction: tx });
            }
            await this.bookGenreModel.destroy({
                where: { book_id: book.id },
                transaction: tx,
            });
            if (genreIds.length > 0) {
                await this.bookGenreModel.bulkCreate(genreIds.map((genreId) => ({
                    book_id: book.id,
                    genre_id: genreId,
                })), { transaction: tx });
            }
            await this.bookPublisherModel.destroy({
                where: { book_id: book.id },
                transaction: tx,
            });
            if (publisherIds.length > 0) {
                await this.bookPublisherModel.bulkCreate(publisherIds.map((publisherId) => ({
                    book_id: book.id,
                    publisher_id: publisherId,
                })), { transaction: tx });
            }
            await this.auditService.log("BOOK.UPDATE", { bookId: book.id, payload }, userId);
            return book;
        });
    }
    async remove(id, userId) {
        return this.sequelize.transaction(async (tx) => {
            const book = await this.bookModel.findByPk(id, { transaction: tx });
            if (!book)
                throw new common_1.NotFoundException(`Book with id ${id} not found`);
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
            await book.destroy({ transaction: tx });
            return { deleted: true };
        });
    }
    async restore(id, userId) {
        return this.sequelize.transaction(async (tx) => {
            const book = await this.bookModel.findOne({
                where: { id },
                paranoid: false,
                transaction: tx,
            });
            if (!book)
                throw new common_1.NotFoundException();
            await book.restore({ transaction: tx });
            await this.auditService.log("BOOK.RESTORE", { bookId: id }, userId);
            return book;
        });
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(book_model_1.Book)),
    __param(1, (0, sequelize_1.InjectModel)(book_author_model_1.BookAuthor)),
    __param(2, (0, sequelize_1.InjectModel)(book_genre_model_1.BookGenre)),
    __param(3, (0, sequelize_1.InjectModel)(book_publisher_model_1.BookPublisher)),
    __param(4, (0, sequelize_1.InjectModel)(author_model_1.Author)),
    __param(5, (0, sequelize_1.InjectModel)(genre_model_1.Genre)),
    __param(6, (0, sequelize_1.InjectModel)(publisher_model_1.Publisher)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, sequelize_typescript_1.Sequelize,
        audit_service_1.AuditService])
], BooksService);
//# sourceMappingURL=books.service.js.map