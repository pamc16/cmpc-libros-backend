import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Author } from "src/books/models/author.model";
import { AuthorsService } from "./authors.service";
import { AuthorsController } from "./authors.controller";

@Module({
  imports: [SequelizeModule.forFeature([Author])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
