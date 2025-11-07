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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const book_author_model_1 = require("./book-author.model");
const author_model_1 = require("./author.model");
const book_genre_model_1 = require("./book-genre.model");
const genre_model_1 = require("./genre.model");
const publisher_model_1 = require("./publisher.model");
const inventory_model_1 = require("./inventory.model");
const book_publisher_model_1 = require("./book-publisher.model");
let Book = class Book extends sequelize_typescript_1.Model {
};
exports.Book = Book;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Book.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: false }),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Book.prototype, "pages", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Book.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: true }),
    __metadata("design:type", Boolean)
], Book.prototype, "availability", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => inventory_model_1.Inventory),
    __metadata("design:type", Array)
], Book.prototype, "inventories", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => author_model_1.Author, () => book_author_model_1.BookAuthor),
    __metadata("design:type", Array)
], Book.prototype, "authors", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => genre_model_1.Genre, () => book_genre_model_1.BookGenre),
    __metadata("design:type", Array)
], Book.prototype, "genres", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => publisher_model_1.Publisher, () => book_publisher_model_1.BookPublisher),
    __metadata("design:type", Array)
], Book.prototype, "publishers", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: true }),
    __metadata("design:type", String)
], Book.prototype, "image", void 0);
exports.Book = Book = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "books", paranoid: false })
], Book);
//# sourceMappingURL=book.model.js.map