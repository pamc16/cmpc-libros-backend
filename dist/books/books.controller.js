"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksController = void 0;
const common_1 = require("@nestjs/common");
const books_service_1 = require("./books.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const csv_1 = require("../utils/csv");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path_1 = require("path");
const logger = new common_1.Logger("BooksController");
let BooksController = class BooksController {
    constructor(booksService) {
        this.booksService = booksService;
    }
    async create(files, body, req) {
        try {
            logger.debug("Headers: " + JSON.stringify(req.headers, null, 2));
            logger.debug("Body keys: " + JSON.stringify(body));
            logger.debug("Files keys: " + JSON.stringify(Object.keys(files || {})));
            logger.debug("Files detail:", JSON.stringify({
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
            }, null, 2));
            const file = files?.image?.[0] ?? files?.file?.[0] ?? null;
            const authors = body.authors ? JSON.parse(body.authors) : [];
            const genres = body.genres ? JSON.parse(body.genres) : [];
            const publishers = body.publishers ? JSON.parse(body.publishers) : [];
            const userId = req.user?.id;
            let imageUrl = null;
            if (file) {
                imageUrl = `/uploads/books/${file.filename}`;
            }
            else {
                logger.debug("No file was uploaded (file === null)");
            }
            return await this.booksService.create({
                ...body,
                authors,
                genres,
                publishers,
                image: imageUrl,
            }, userId);
        }
        catch (err) {
            logger.error("Error en create controller", err?.message || err);
            if (err instanceof SyntaxError)
                throw new common_1.BadRequestException("Payload JSON inválido en authors/genres/publishers");
            throw new common_1.InternalServerErrorException(err?.message || "Error al crear book");
        }
    }
    findAll(page, limit, title, genre, publisher, author, availability, sort) {
        let availabilityBool = undefined;
        if (typeof availability === "string") {
            if (availability === "true")
                availabilityBool = true;
            else if (availability === "false")
                availabilityBool = false;
            else
                throw new common_1.BadRequestException('availability must be "true" or "false"');
        }
        const parseSort = (s) => {
            if (!s || !s.trim())
                return [];
            const parts = s
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);
            const allowedFields = [
                "title",
                "price",
                "pages",
                "createdAt",
                "updatedAt",
                "availability",
                "publisher",
                "author",
            ];
            const result = parts.map((part) => {
                const [fieldRaw, dirRaw] = part.split(":").map((x) => x.trim());
                const field = fieldRaw;
                const dir = (dirRaw || "asc").toLowerCase();
                if (!allowedFields.includes(field)) {
                    throw new common_1.BadRequestException(`Sort field "${field}" is not allowed`);
                }
                if (dir !== "asc" && dir !== "desc") {
                    throw new common_1.BadRequestException(`Sort direction for "${field}" must be "asc" or "desc"`);
                }
                return { field, dir: dir };
            });
            return result;
        };
        const sortParsed = parseSort(sort);
        const opts = {
            page,
            limit,
            title,
            genre,
            publisher,
            author,
            availability: availabilityBool,
            sort: sortParsed,
        };
        return this.booksService.findAll(opts);
    }
    async exportCsv(res, title) {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="books.csv"`);
        const stream = await (0, csv_1.streamBooksToCsv)(this.booksService, { title });
        stream.pipe(res);
    }
    findOne(id) {
        return this.booksService.findOne(id);
    }
    update(id, body, req) {
        console.log("Update DTO received in controller:", body);
        const userId = req.user?.id;
        const authors = body.authors ? JSON.parse(body.authors) : [];
        const genres = body.genres ? JSON.parse(body.genres) : [];
        const publishers = body.publishers ? JSON.parse(body.publishers) : [];
        return this.booksService.update(id, { ...body, authors: authors, genres: genres, publishers: publishers }, userId);
    }
    remove(id, req) {
        const userId = req.user?.id;
        return this.booksService.remove(id, userId);
    }
    restore(id, req) {
        const userId = req.user?.id;
        return this.booksService.restore(id, userId);
    }
};
exports.BooksController = BooksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                try {
                    const uploadPath = (0, path_1.join)(process.cwd(), "uploads", "books");
                    if (!fs.existsSync(uploadPath))
                        fs.mkdirSync(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                }
                catch (err) {
                    logger.error("Error creando carpeta de uploads", err?.message);
                    cb(err, 'uploads');
                }
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const fileExt = (0, path_1.extname)(file.originalname) || "";
                cb(null, `${uniqueSuffix}${fileExt}`);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (/image\/(jpeg|png|gif|webp)/.test(file.mimetype))
                cb(null, true);
            else
                cb(null, false);
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("page", new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("limit", new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)("title")),
    __param(3, (0, common_1.Query)("genre")),
    __param(4, (0, common_1.Query)("publisher")),
    __param(5, (0, common_1.Query)("author")),
    __param(6, (0, common_1.Query)("availability")),
    __param(7, (0, common_1.Query)("sort")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("export/csv"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)("title")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(":id/restore"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BooksController.prototype, "restore", null);
exports.BooksController = BooksController = __decorate([
    (0, common_1.Controller)("books"),
    __metadata("design:paramtypes", [books_service_1.BooksService])
], BooksController);
//# sourceMappingURL=books.controller.js.map