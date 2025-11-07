// src/auth/auth.controller.spec.ts
import 'reflect-metadata'; // necesario para leer metadata de decoradores
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  let authServiceMock: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authServiceMock = {
      validateUser: jest.fn(),
      login: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login - should validate user and return login result when credentials are valid', async () => {
    const body = { username: 'user1', password: 'secret' };
    const user = { id: 'u1', username: 'user1' };
    const loginResult = { access_token: 'tok', expiresIn: 3600, user };

    (authServiceMock.validateUser as jest.Mock).mockResolvedValue(user);
    (authServiceMock.login as jest.Mock).mockResolvedValue(loginResult);

    const res = await controller.login(body);

    expect(authServiceMock.validateUser).toHaveBeenCalledWith('user1', 'secret');
    expect(authServiceMock.login).toHaveBeenCalledWith(user);
    expect(res).toBe(loginResult);
  });

  it('login - should throw UnauthorizedException when credentials invalid', async () => {
    const body = { username: 'bad', password: 'wrong' };
    (authServiceMock.validateUser as jest.Mock).mockResolvedValue(null);

    await expect(controller.login(body)).rejects.toThrow(UnauthorizedException);
    expect(authServiceMock.validateUser).toHaveBeenCalledWith('bad', 'wrong');
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should have HttpCode 200 on login route', () => {
    const metadata = Reflect.getMetadata(HTTP_CODE_METADATA, AuthController.prototype.login);
    expect(metadata).toBe(HttpStatus.OK);
  });
});
