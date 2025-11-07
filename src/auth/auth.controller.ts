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
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
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
  @ApiOkResponse({
    description: 'Token generado correctamente.',
    // opcional: puedes describir la forma de la respuesta si quieres
    // schema: { example: { access_token: 'eyJ...', expiresIn: 3600, user: { id: 1, username: 'juan' } } }
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  @ApiBadRequestResponse({ description: 'Request body inválido.' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ✅ Aquí se usa validateUser, y luego login genera el JWT
    return this.authService.login(user);
  }
}
