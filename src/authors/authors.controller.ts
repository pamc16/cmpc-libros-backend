import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { AuthorsService } from "./authors.service";

@ApiTags("authors")
@Controller("authors")
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Crear un nuevo autor" })
  @ApiResponse({ status: 201, description: "Autor creado exitosamente." })
  create(@Body() createAuthorDto: any) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los autores" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiQuery({
    name: "search",
    required: false,
    example: "Gabriel García Márquez",
  })
  @ApiResponse({ status: 200, description: "Lista de autores." })
  findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    return this.authorsService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un autor por ID" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, description: "Autor encontrado." })
  findOne(@Param("id", ParseIntPipe) id: string) {
    return this.authorsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar un autor" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, description: "Autor actualizado." })
  update(
    @Param("id", ParseIntPipe) id: string,
    @Body() updateAuthorDto: any
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar un autor" })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 204, description: "Autor eliminado." })
  remove(@Param("id", ParseIntPipe) id: string) {
    return this.authorsService.remove(id);
  }
}
