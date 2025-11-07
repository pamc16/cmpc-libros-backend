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
exports.AuthorsController = exports.UpdateAuthorDto = exports.CreateAuthorDto = void 0;
const common_1 = require("@nestjs/common");
const authors_service_1 = require("./authors.service");
class CreateAuthorDto {
}
exports.CreateAuthorDto = CreateAuthorDto;
class UpdateAuthorDto {
}
exports.UpdateAuthorDto = UpdateAuthorDto;
let AuthorsController = class AuthorsController {
    constructor(authorsService) {
        this.authorsService = authorsService;
    }
    create(createAuthorDto) {
        return this.authorsService.create(createAuthorDto);
    }
    findAll(page = '1', limit = '10', search) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
        return this.authorsService.findAll({ page: pageNum, limit: limitNum, search });
    }
    findOne(id) {
        return this.authorsService.findOne(id);
    }
    update(id, updateAuthorDto) {
        return this.authorsService.update(id, updateAuthorDto);
    }
    remove(id) {
        return this.authorsService.remove(id);
    }
};
exports.AuthorsController = AuthorsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAuthorDto]),
    __metadata("design:returntype", void 0)
], AuthorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], AuthorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAuthorDto]),
    __metadata("design:returntype", void 0)
], AuthorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthorsController.prototype, "remove", null);
exports.AuthorsController = AuthorsController = __decorate([
    (0, common_1.Controller)('authors'),
    __metadata("design:paramtypes", [authors_service_1.AuthorsService])
], AuthorsController);
//# sourceMappingURL=authors.controller.js.map