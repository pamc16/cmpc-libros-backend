import { SequelizeModuleOptions } from "@nestjs/sequelize";
import { Book } from "../books/models/book.model";
import { Author } from "../books/models/author.model";
import { Publisher } from "../publishers/publisher.model";
import { Genre } from "../books/models/genre.model";
import { Inventory } from "../books/models/inventory.model";
import { AuditLog } from "../audit/audit.model";
import * as process from "process";
import { BookAuthor } from "src/books/models/book-author.model";
import { BookGenre } from "src/books/models/book-genre.model";
import { BookPublisher } from "src/books/models/book-publisher.model";

export function createSequelizeInstance(): SequelizeModuleOptions {
  return {
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "123456789",
    database: process.env.DB_NAME || "db-cmpc-libros",
    models: [
      Book,
      Author,
      Publisher,
      Genre,
      Inventory,
      AuditLog,
      BookAuthor,
      BookGenre,
      BookPublisher,
    ],
    autoLoadModels: true,
    synchronize: false,
    logging: (msg) => console.debug("[sequelize]", msg),
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: true, timestamps: true },
  };
}
