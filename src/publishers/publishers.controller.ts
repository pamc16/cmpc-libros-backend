import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { PublisherService } from "./publishers.service";

@ApiTags("publishers")
@Controller("publishers")
export class PublishersController {
  constructor(private readonly publisherService: PublisherService) {}

  @Get()
  @ApiOperation({ summary: "Listar todas las editoriales" })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "Número de página para paginación",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 10,
    description: "Cantidad máxima de registros por página (máx. 100)",
  })
  @ApiQuery({
    name: "search",
    required: false,
    example: "Penguin Random House",
    description: "Texto de búsqueda por nombre o descripción",
  })
  @ApiOkResponse({
    description: "Lista de editoriales obtenida exitosamente.",
    schema: {
      example: {
        total: 25,
        page: 1,
        limit: 10,
        data: [
          {
            id: 1,
            name: "Penguin Random House",
            country: "Estados Unidos",
            founded: 2013,
          },
          {
            id: 2,
            name: "Planeta",
            country: "España",
            founded: 1949,
          },
        ],
      },
    },
  })
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
  @ApiOperation({ summary: "Obtener una editorial por ID" })
  @ApiParam({
    name: "id",
    example: 1,
    description: "ID de la editorial que se desea obtener",
  })
  @ApiOkResponse({
    description: "Editorial encontrada exitosamente.",
    schema: {
      example: {
        id: 1,
        name: "Penguin Random House",
        country: "Estados Unidos",
        founded: 2013,
      },
    },
  })
  @ApiBadRequestResponse({ description: "ID inválido o no encontrado." })
  findOne(@Param("id", ParseIntPipe) id: string) {
    return this.publisherService.findOne(id);
  }
}
