import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";
import { Sequelize } from "sequelize-typescript";
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false })
  );
  // en main.ts o config init
  const sequelize = app.get(Sequelize); // si lo expusiste
  await sequelize.sync({ alter: true }); // o { force: true } para recrear
  // Use Zod pipe where appropriate in controllers (example controllers include it)
  await app.listen(process.env.PORT || 3000);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  console.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();
