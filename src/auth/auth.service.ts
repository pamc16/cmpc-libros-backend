import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Validar usuario (simulado, deberías usar tu modelo Sequelize)
  async validateUser(username: string, password: string): Promise<any> {
    const fakeUser = {
      id: '123',
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 10),
    };

    const isMatch = await bcrypt.compare(password, fakeUser.passwordHash);
    if (username === fakeUser.username && isMatch) {
      const { passwordHash, ...result } = fakeUser;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateJwtPayload(payload: any) {
    // Verifica si el usuario existe (usa tu base de datos real aquí)
    if (!payload?.sub || !payload?.username) return null;
    return { id: payload.sub, username: payload.username };
  }
}
