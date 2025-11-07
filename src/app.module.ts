import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { BooksModule } from "./books/books.module";
import { AuthModule } from "./auth/auth.module";
import { AuditModule } from "./audit/audit.module";
import { createSequelizeInstance } from "./config/database.config";
import { GenresModule } from "./genres/genres.module";
import { AuthorsModule } from "./authors/authors.module";
import { PublisherModule } from "./publishers/publishers.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot(createSequelizeInstance()),
    PublisherModule,
    GenresModule,
    AuthorsModule,
    BooksModule,
    AuthModule,
    AuditModule,
  ],
})
export class AppModule {}
