import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { GenresService } from "./genres.service";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGenreDto {
  @ApiProperty({ example: "Fantasía", description: "Nombre del género" })
  readonly name!: string;

  @ApiProperty({
    example: "Historias con elementos mágicos o sobrenaturales",
    required: false,
    description: "Descripción del género",
  })
  readonly description?: string;
}

export class UpdateGenreDto {
  @ApiProperty({ example: "Ciencia ficción", required: false })
  readonly name?: string;

  @ApiProperty({
    example: "Narraciones basadas en avances tecnológicos o científicos",
    required: false,
  })
  readonly description?: string;
}

@ApiTags("genres")
@Controller("genres")
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Crear un nuevo género literario" })
  @ApiBody({ type: CreateGenreDto })
  @ApiCreatedResponse({ description: "Género creado exitosamente." })
  @ApiBadRequestResponse({ description: "Datos inválidos." })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los géneros" })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "Número de página",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 10,
    description: "Cantidad por página",
  })
  @ApiQuery({
    name: "search",
    required: false,
    example: "Terror",
    description: "Filtrar géneros por nombre o descripción",
  })
  @ApiOkResponse({ description: "Lista de géneros obtenida exitosamente." })
  findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    return this.genresService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un género por su ID" })
  @ApiParam({ name: "id", example: 1, description: "ID del género" })
  @ApiOkResponse({ description: "Género encontrado exitosamente." })
  @ApiBadRequestResponse({ description: "ID inválido." })
  findOne(@Param("id", ParseIntPipe) id: string) {
    return this.genresService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar un género existente" })
  @ApiParam({
    name: "id",
    example: 1,
    description: "ID del género a actualizar",
  })
  @ApiBody({ type: UpdateGenreDto })
  @ApiOkResponse({ description: "Género actualizado exitosamente." })
  @ApiBadRequestResponse({ description: "Datos inválidos." })
  update(
    @Param("id", ParseIntPipe) id: string,
    @Body() updateGenreDto: UpdateGenreDto
  ) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar un género por ID" })
  @ApiParam({ name: "id", example: 1, description: "ID del género a eliminar" })
  @ApiNoContentResponse({ description: "Género eliminado exitosamente." })
  remove(@Param("id", ParseIntPipe) id: string) {
    return this.genresService.remove(id);
  }
}
