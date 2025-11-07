import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'usuario' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'Password#123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'Nombre Apellido' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
