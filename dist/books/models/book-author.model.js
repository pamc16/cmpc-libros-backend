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
exports.BookAuthor = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const book_model_1 = require("./book.model");
const author_model_1 = require("./author.model");
let BookAuthor = class BookAuthor extends sequelize_typescript_1.Model {
};
exports.BookAuthor = BookAuthor;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => book_model_1.Book),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    __metadata("design:type", String)
], BookAuthor.prototype, "book_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => author_model_1.Author),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    __metadata("design:type", String)
], BookAuthor.prototype, "author_id", void 0);
exports.BookAuthor = BookAuthor = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'book_authors', timestamps: false })
], BookAuthor);
//# sourceMappingURL=book-author.model.js.map