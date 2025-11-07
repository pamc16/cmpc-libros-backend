// src/auth/jwt.strategy.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authServiceMock: Partial<Record<keyof AuthService, jest.Mock>>;
  let configServiceMock: Partial<Record<keyof ConfigService, jest.Mock>>;

  beforeEach(() => {
    authServiceMock = {
      validateJwtPayload: jest.fn(),
    } as any;

    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        return undefined;
      }),
    } as any;

    // Instancia la estrategia con los mocks
    strategy = new JwtStrategy(authServiceMock as any, configServiceMock as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should call configService.get for JWT_SECRET in constructor', () => {
    // el mock se llamó durante la construcción del objeto
    expect(configServiceMock.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('validate() should return user when authService.validateJwtPayload returns a user', async () => {
    const payload = { sub: '123', username: 'user1' };
    const user = { id: '123', username: 'user1' };
    (authServiceMock.validateJwtPayload as jest.Mock).mockResolvedValue(user);

    await expect(strategy.validate(payload)).resolves.toBe(user);
    expect(authServiceMock.validateJwtPayload).toHaveBeenCalledWith(payload);
  });

  it('validate() should throw UnauthorizedException when authService.validateJwtPayload returns null', async () => {
    const payload = { sub: '999', username: 'noone' };
    (authServiceMock.validateJwtPayload as jest.Mock).mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    expect(authServiceMock.validateJwtPayload).toHaveBeenCalledWith(payload);
  });
});
