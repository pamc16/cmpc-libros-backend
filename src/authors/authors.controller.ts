import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';

export class CreateAuthorDto {
  readonly name!: string;
  readonly bio?: string;
  readonly birthDate?: string; // ISO string
}

export class UpdateAuthorDto {
  readonly name?: string;
  readonly bio?: string;
  readonly birthDate?: string;
}

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {} // Reemplazar `any` por AuthorsService

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAuthorDto: CreateAuthorDto) {
    // delega la lógica al servicio
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    return this.authorsService.findAll({ page: pageNum, limit: limitNum, search });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.authorsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.authorsService.remove(id);
  }
}
