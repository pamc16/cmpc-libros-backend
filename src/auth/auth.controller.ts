import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LoginDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login: valida credenciales y devuelve access_token (JWT)
   * Respuesta esperada: { access_token: string, expiresIn?: number, user?: {...} }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Token generado correctamente.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ✅ Aquí se usa validateUser, y luego login genera el JWT
    return this.authService.login(user);
  }
}
