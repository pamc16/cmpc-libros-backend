import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PublisherService } from "./publishers.service";
import { PublishersController } from "./publishers.controller";
import { Publisher } from "src/publishers/publisher.model";

@Module({
  imports: [SequelizeModule.forFeature([Publisher])],
  controllers: [PublishersController],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class PublisherModule {}
