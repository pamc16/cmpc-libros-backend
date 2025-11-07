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
exports.PublishersController = void 0;
const common_1 = require("@nestjs/common");
const publishers_service_1 = require("./publishers.service");
let PublishersController = class PublishersController {
    constructor(publisherService) {
        this.publisherService = publisherService;
    }
    findAll(page = "1", limit = "10", search) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
        return this.publisherService.findAll({
            page: pageNum,
            limit: limitNum,
            search,
        });
    }
    findOne(id) {
        return this.publisherService.findOne(id);
    }
};
exports.PublishersController = PublishersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], PublishersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublishersController.prototype, "findOne", null);
exports.PublishersController = PublishersController = __decorate([
    (0, common_1.Controller)("publishers"),
    __metadata("design:paramtypes", [publishers_service_1.PublisherService])
], PublishersController);
//# sourceMappingURL=publishers.controller.js.map