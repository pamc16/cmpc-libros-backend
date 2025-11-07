"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const dotenv = require("dotenv");
const app_module_1 = require("./app.module");
const sequelize_typescript_1 = require("sequelize-typescript");
const path_1 = require("path");
const express = require("express");
async function bootstrap() {
    dotenv.config();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));
    const sequelize = app.get(sequelize_typescript_1.Sequelize);
    await sequelize.sync({ alter: true });
    await app.listen(process.env.PORT || 3000);
    app.use('/uploads', express.static((0, path_1.join)(__dirname, '..', 'uploads')));
    console.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map