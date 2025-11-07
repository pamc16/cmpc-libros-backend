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
exports.PublisherService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_2 = require("sequelize");
const publisher_model_1 = require("../books/models/publisher.model");
let PublisherService = class PublisherService {
    constructor(publisherModel, sequelize) {
        this.publisherModel = publisherModel;
        this.sequelize = sequelize;
    }
    async create(payload, userId) {
        return this.sequelize.transaction(async (tx) => {
            const author = await this.publisherModel.create(payload, { transaction: tx });
            return author;
        });
    }
    async findAll(opts = { page: 1, limit: 20, search: undefined }) {
        const where = {};
        if (opts.search) {
            where[sequelize_2.Op.or] = [
                { name: { [sequelize_2.Op.iLike]: `%${opts.search}%` } },
                { bio: { [sequelize_2.Op.iLike]: `%${opts.search}%` } },
            ];
        }
        const limit = Number(opts.limit) || 20;
        const offset = ((Number(opts.page) || 1) - 1) * limit;
        return this.publisherModel.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] });
    }
    async findOne(id) {
        const author = await this.publisherModel.findByPk(id);
        if (!author)
            throw new common_1.NotFoundException();
        return author;
    }
    async update(id, dto, userId) {
        return this.sequelize.transaction(async (tx) => {
            const author = await this.publisherModel.findByPk(id, { transaction: tx });
            if (!author)
                throw new common_1.NotFoundException();
            await author.update(dto, { transaction: tx });
            return author;
        });
    }
    async remove(id, userId) {
        return this.sequelize.transaction(async (tx) => {
            const author = await this.publisherModel.findByPk(id, { transaction: tx });
            if (!author)
                throw new common_1.NotFoundException();
            await author.destroy({ transaction: tx });
            return { deleted: true };
        });
    }
    async restore(id, userId) {
        return this.sequelize.transaction(async (tx) => {
            const author = await this.publisherModel.findOne({ where: { id }, paranoid: false, transaction: tx });
            if (!author)
                throw new common_1.NotFoundException();
            await author.restore({ transaction: tx });
            return author;
        });
    }
};
exports.PublisherService = PublisherService;
exports.PublisherService = PublisherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(publisher_model_1.Publisher)),
    __metadata("design:paramtypes", [Object, sequelize_typescript_1.Sequelize])
], PublisherService);
//# sourceMappingURL=publishers.service.js.map