import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Genre } from 'src/books/models/genre.model';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';

@Module({
  imports: [SequelizeModule.forFeature([Genre])],
  providers: [GenresService],
  controllers: [GenresController],
  exports: [GenresService],
})
export class GenresModule {}
