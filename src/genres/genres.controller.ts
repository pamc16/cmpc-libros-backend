import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { GenresService } from "./genres.service";

export class CreateGenreDto {
  readonly name!: string;
  readonly description?: string;
}

export class UpdateGenreDto {
  readonly name?: string;
  readonly description?: string;
}


@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {} // Reemplazar `any` por GenresService

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    return this.genresService.findAll({ page: pageNum, limit: limitNum, search });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.genresService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.genresService.remove(id);
  }
}