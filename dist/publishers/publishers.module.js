"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublisherModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const publishers_service_1 = require("./publishers.service");
const publishers_controller_1 = require("./publishers.controller");
const publisher_model_1 = require("../books/models/publisher.model");
let PublisherModule = class PublisherModule {
};
exports.PublisherModule = PublisherModule;
exports.PublisherModule = PublisherModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([publisher_model_1.Publisher])],
        controllers: [publishers_controller_1.PublishersController],
        providers: [publishers_service_1.PublisherService],
        exports: [publishers_service_1.PublisherService],
    })
], PublisherModule);
//# sourceMappingURL=publishers.module.js.map