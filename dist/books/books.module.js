"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const books_service_1 = require("./books.service");
const books_controller_1 = require("./books.controller");
const book_model_1 = require("./models/book.model");
const author_model_1 = require("./models/author.model");
const publisher_model_1 = require("./models/publisher.model");
const genre_model_1 = require("./models/genre.model");
const inventory_model_1 = require("./models/inventory.model");
const audit_module_1 = require("../audit/audit.module");
const book_author_model_1 = require("./models/book-author.model");
const book_genre_model_1 = require("./models/book-genre.model");
const book_publisher_model_1 = require("./models/book-publisher.model");
let BooksModule = class BooksModule {
};
exports.BooksModule = BooksModule;
exports.BooksModule = BooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                book_model_1.Book,
                author_model_1.Author,
                publisher_model_1.Publisher,
                genre_model_1.Genre,
                inventory_model_1.Inventory,
                book_author_model_1.BookAuthor,
                book_genre_model_1.BookGenre,
                book_publisher_model_1.BookPublisher,
            ]),
            audit_module_1.AuditModule,
        ],
        providers: [books_service_1.BooksService],
        controllers: [books_controller_1.BooksController],
        exports: [books_service_1.BooksService],
    })
], BooksModule);
//# sourceMappingURL=books.module.js.map