import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // El token se toma del header Authorization: Bearer <token>
      ignoreExpiration: false, // Rechaza tokens expirados automáticamente
      secretOrKey: configService.get<string>('JWT_SECRET'), // Clave secreta del .env
    });
  }

  async validate(payload: any) {
    // payload viene del token JWT (lo que pusiste en sign)
    const user = await this.authService.validateJwtPayload(payload);

    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }

    // Devuelve lo que estará disponible en `req.user`
    return user;
  }
}
