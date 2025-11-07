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
exports.BookGenre = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const book_model_1 = require("./book.model");
const genre_model_1 = require("./genre.model");
let BookGenre = class BookGenre extends sequelize_typescript_1.Model {
};
exports.BookGenre = BookGenre;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => book_model_1.Book),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    __metadata("design:type", String)
], BookGenre.prototype, "book_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => genre_model_1.Genre),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    __metadata("design:type", String)
], BookGenre.prototype, "genre_id", void 0);
exports.BookGenre = BookGenre = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'book_genres', timestamps: false })
], BookGenre);
//# sourceMappingURL=book-genre.model.js.map