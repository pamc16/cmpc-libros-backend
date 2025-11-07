import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}
