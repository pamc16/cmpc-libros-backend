import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { Book } from "./models/book.model";
import { Author } from "./models/author.model";
import { Publisher } from "../publishers/publisher.model";
import { Genre } from "./models/genre.model";
import { Inventory } from "./models/inventory.model";
import { AuditModule } from "../audit/audit.module";
import { BookAuthor } from "./models/book-author.model";
import { BookGenre } from "./models/book-genre.model";
import { BookPublisher } from "./models/book-publisher.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Book,
      Author,
      Publisher,
      Genre,
      Inventory,
      BookAuthor,
      BookGenre,
      BookPublisher,
    ]),
    AuditModule,
  ],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}
