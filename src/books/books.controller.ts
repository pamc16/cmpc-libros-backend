import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
  InternalServerErrorException,
  UploadedFiles,
  Logger,
} from "@nestjs/common";
import { BooksService } from "./books.service";

declare module "express" {
  interface Request {
    user?: { id: string };
  }
}
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { streamBooksToCsv } from "../utils/csv";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { Request, Response } from "express";
import { diskStorage } from "multer";
import * as fs from "fs";
import { extname, join } from "path";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";

type SortItem = { field: string; dir: "asc" | "desc" };
const logger = new Logger("BooksController");

@ApiTags("books") // Agrupa los endpoints
@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * CREATE - multipart/form-data con posible archivo image/file
   */
  @ApiOperation({ summary: "Crea un libro" })
  @ApiResponse({
    status: 201,
    description: "Libro creado con éxito.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description:
      "Datos del libro. authors/genres/publishers deben enviarse como JSON stringificados.",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", example: "Cien años de soledad" },
        description: { type: "string" },
        authors: { type: "string", example: '["Gabriel García Márquez"]' },
        genres: { type: "string", example: '["Novela"]' },
        publishers: { type: "string", example: '["Editorial X"]' },
        price: { type: "number", example: 12.5 },
        availability: { type: "boolean", example: true },
        image: { type: "object", format: "binary" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 }, // acepta también 'file' por compatibilidad
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            try {
              const uploadPath = join(process.cwd(), "uploads", "books");
              if (!fs.existsSync(uploadPath))
                fs.mkdirSync(uploadPath, { recursive: true });
              cb(null, uploadPath);
            } catch (err) {
              logger.error(
                "Error creando carpeta de uploads",
                (err as any)?.message
              );
              cb(err as any, "uploads");
            }
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname) || "";
            cb(null, `${uniqueSuffix}${fileExt}`);
          },
        }),
        // opcional: limits, fileFilter
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
        fileFilter: (req, file, cb) => {
          // acepta imágenes comunes
          if (/image\/(jpeg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
          else cb(null, false);
        },
      }
    )
  )
  async create(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @Body() body: any,
    @Req() req: Request
  ) {
    try {
      // logs para debugging — revisa consola de Nest
      logger.debug("Headers: " + JSON.stringify(req.headers, null, 2));
      logger.debug("Body keys: " + JSON.stringify(body));
      logger.debug("Files keys: " + JSON.stringify(Object.keys(files || {})));
      logger.debug(
        "Files detail:",
        JSON.stringify(
          {
            image: files?.image?.[0]
              ? {
                  originalname: files.image[0].originalname,
                  filename: files.image[0].filename,
                  path: files.image[0].path,
                }
              : null,
            file: files?.file?.[0]
              ? {
                  originalname: files.file[0].originalname,
                  filename: files.file[0].filename,
                  path: files.file[0].path,
                }
              : null,
          },
          null,
          2
        )
      );

      // escoger el archivo disponible (image tiene prioridad)
      const file = files?.image?.[0] ?? files?.file?.[0] ?? null;

      // parse arrays JSON (protección contra body vacío)
      const authors = body.authors ? JSON.parse(body.authors) : [];
      const genres = body.genres ? JSON.parse(body.genres) : [];
      const publishers = body.publishers ? JSON.parse(body.publishers) : [];

      const userId = (req.user as any)?.id;

      let imageUrl: string | null = null;
      if (file) {
        imageUrl = `/uploads/books/${file.filename}`;
      } else {
        logger.debug("No file was uploaded (file === null)");
      }

      return await this.booksService.create(
        {
          ...body,
          authors,
          genres,
          publishers,
          image: imageUrl,
        },
        userId
      );
    } catch (err: any) {
      logger.error("Error en create controller", err?.message || err);
      if (err instanceof SyntaxError)
        throw new BadRequestException(
          "Payload JSON inválido en authors/genres/publishers"
        );
      throw new InternalServerErrorException(
        err?.message || "Error al crear book"
      );
    }
  }

  /**
   * FIND ALL - query params documentados
   */
  @ApiOperation({ summary: "Obtener todos los libros" })
  @ApiResponse({
    status: 200,
    description: "Lista de libros obtenida con éxito.",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "title", required: false, type: String })
  @ApiQuery({ name: "genre", required: false, type: String })
  @ApiQuery({ name: "publisher", required: false, type: String })
  @ApiQuery({ name: "author", required: false, type: String })
  @ApiQuery({
    name: "availability",
    required: false,
    type: String,
    description: 'Use "true" or "false"',
  })
  @ApiQuery({
    name: "sort",
    required: false,
    type: String,
    description: 'Ej: "title:asc,price:desc"',
  })
  @Get()
  findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("title") title?: string,
    @Query("genre") genre?: string,
    @Query("publisher") publisher?: string,
    @Query("author") author?: string,
    @Query("availability") availability?: string, // 'true'|'false'|undefined
    @Query("sort") sort?: string // ex: "title:asc,price:desc"
  ) {
    // Normalizar availability a boolean | undefined
    let availabilityBool: boolean | undefined = undefined;
    if (typeof availability === "string") {
      if (availability === "true") availabilityBool = true;
      else if (availability === "false") availabilityBool = false;
      else
        throw new BadRequestException('availability must be "true" or "false"');
    }

    // Parse multi-sort string -> Array<{field, dir}>
    const parseSort = (s?: string): SortItem[] => {
      if (!s || !s.trim()) return [];
      const parts = s
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      // Lista blanca de campos permitidos para ordenar (ajusta a tus columnas reales)
      const allowedFields = [
        "title",
        "price",
        "pages",
        "createdAt",
        "updatedAt",
        "availability",
        "publisher", // si usas joins, mapea correctamente en el servicio
        "author", // idem
      ];

      const result: SortItem[] = parts.map((part) => {
        const [fieldRaw, dirRaw] = part.split(":").map((x) => x.trim());
        const field = fieldRaw;
        const dir = (dirRaw || "asc").toLowerCase();

        if (!allowedFields.includes(field)) {
          throw new BadRequestException(`Sort field "${field}" is not allowed`);
        }
        if (dir !== "asc" && dir !== "desc") {
          throw new BadRequestException(
            `Sort direction for "${field}" must be "asc" or "desc"`
          );
        }
        return { field, dir: dir as "asc" | "desc" };
      });

      return result;
    };

    const sortParsed = parseSort(sort);

    // Construye el objeto de opciones que espera tu service
    const opts = {
      page,
      limit,
      title,
      genre,
      publisher,
      author,
      availability: availabilityBool,
      sort: sortParsed, // el service debe interpretar este array
    };

    return this.booksService.findAll(opts);
  }

  /**
   * EXPORT CSV
   */
  @ApiOperation({ summary: "Exportar información a csv" })
  @ApiResponse({
    status: 200,
    description: "Información exportada con exito con exito.",
  })
  @ApiQuery({ name: "title", required: false, type: String })
  @Get("export/csv")
  async exportCsv(@Res() res: Response, @Query("title") title?: string) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="books.csv"`);
    const stream = await streamBooksToCsv(this.booksService, { title });
    stream.pipe(res);
  }

  /**
   * FIND ONE
   */
  @ApiOperation({ summary: "Obtener un libro por id" })
  @ApiResponse({ status: 200, description: "Libro encontrado." })
  @ApiResponse({ status: 404, description: "Libro no encontrado." })
  @ApiParam({ name: "id", description: "ID del libro" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.booksService.findOne(id);
  }

  /**
   * UPDATE
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Actualizar un libro por id" })
  @ApiResponse({ status: 200, description: "Libro actualizado." })
  @ApiResponse({ status: 401, description: "No autorizado." })
  @ApiParam({ name: "id", description: "ID del libro a actualizar" })
  @ApiBody({
    description:
      "Cuerpo de actualización. authors/genres/publishers como JSON stringificados si aplican.",
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        authors: { type: "string", example: '["Autor1","Autor2"]' },
        genres: { type: "string", example: '["Género1"]' },
        publishers: { type: "string", example: '["Editorial"]' },
        price: { type: "number" },
        availability: { type: "boolean" },
      },
    },
  })
  @Put(":id")
  update(@Param("id") id: string, @Body() body: any, @Req() req: Request) {
    console.log("Update DTO received in controller:", body);
    const userId = (req.user as any)?.id;
    const authors = body.authors ? JSON.parse(body.authors) : [];
    const genres = body.genres ? JSON.parse(body.genres) : [];
    const publishers = body.publishers ? JSON.parse(body.publishers) : [];
    return this.booksService.update(
      id,
      { ...body, authors: authors, genres: genres, publishers: publishers },
      userId
    );
  }

  /**
   * DELETE
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Eliminar un libro por id" })
  @ApiResponse({ status: 200, description: "Libro eliminado." })
  @ApiResponse({ status: 401, description: "No autorizado." })
  @ApiParam({ name: "id", description: "ID del libro a eliminar" })
  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.booksService.remove(id, userId);
  }

  /**
   * RESTORE
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Restaurar un libro eliminado por id" })
  @ApiResponse({ status: 200, description: "Libro restaurado." })
  @ApiResponse({ status: 401, description: "No autorizado." })
  @ApiParam({ name: "id", description: "ID del libro a restaurar" })
  @Post(":id/restore")
  restore(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    return this.booksService.restore(id, userId);
  }
}
