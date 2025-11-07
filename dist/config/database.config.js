"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSequelizeInstance = createSequelizeInstance;
const book_model_1 = require("../books/models/book.model");
const author_model_1 = require("../books/models/author.model");
const publisher_model_1 = require("../books/models/publisher.model");
const genre_model_1 = require("../books/models/genre.model");
const inventory_model_1 = require("../books/models/inventory.model");
const audit_model_1 = require("../audit/audit.model");
const process = require("process");
const book_author_model_1 = require("../books/models/book-author.model");
const book_genre_model_1 = require("../books/models/book-genre.model");
const book_publisher_model_1 = require("../books/models/book-publisher.model");
function createSequelizeInstance() {
    return {
        dialect: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASS || "123456789",
        database: process.env.DB_NAME || "db-cmpc-libros",
        models: [
            book_model_1.Book,
            author_model_1.Author,
            publisher_model_1.Publisher,
            genre_model_1.Genre,
            inventory_model_1.Inventory,
            audit_model_1.AuditLog,
            book_author_model_1.BookAuthor,
            book_genre_model_1.BookGenre,
            book_publisher_model_1.BookPublisher,
        ],
        autoLoadModels: true,
        synchronize: false,
        logging: (msg) => console.debug("[sequelize]", msg),
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: { underscored: true, timestamps: true },
    };
}
//# sourceMappingURL=database.config.js.map