import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { PublisherService } from "./publishers.service";

@Controller("publishers")
export class PublishersController {
  constructor(private readonly publisherService: PublisherService) {} // Reemplazar `any` por AuthorsService

  @Get()
  findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    return this.publisherService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
    });
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: string) {
    return this.publisherService.findOne(id);
  }
}
