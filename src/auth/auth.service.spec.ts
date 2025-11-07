// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService (unit)', () => {
  let service: AuthService;
  const jwtMock = { sign: jest.fn() } as unknown as JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateUser', () => {
    it('should return user payload when credentials are correct', async () => {
      // For controlability, mock bcrypt.compare to return true
      const compareSpy = jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);

      const res = await service.validateUser('admin', 'admin123');

      // bcrypt.compare was called with the provided password and some hash
      expect(compareSpy).toHaveBeenCalledWith('admin123', expect.any(String));

      // result should be user object without passwordHash
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', '123');
      expect(res).toHaveProperty('username', 'admin');
      expect((res as any).passwordHash).toBeUndefined();
    });

    it('should return null when username is wrong even if password matches', async () => {
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);
      const res = await service.validateUser('wronguser', 'admin123');
      expect(res).toBeNull();
    });

    it('should return null when password does not match', async () => {
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(false);
      const res = await service.validateUser('admin', 'badpassword');
      expect(res).toBeNull();
    });
  });

  describe('login', () => {
    it('should call jwtService.sign and return access_token', async () => {
      const user = { id: 'u1', username: 'user1' };
      (jwtMock.sign as jest.Mock).mockReturnValue('signed-token');

      const res = await service.login(user);

      expect(jwtMock.sign).toHaveBeenCalledWith({ sub: user.id, username: user.username });
      expect(res).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('validateJwtPayload', () => {
    it('should return user object when payload has sub and username', async () => {
      const payload = { sub: '123', username: 'admin' };
      const res = await service.validateJwtPayload(payload);
      expect(res).toEqual({ id: '123', username: 'admin' });
    });

    it('should return null when payload missing fields', async () => {
      expect(await service.validateJwtPayload({})).toBeNull();
      expect(await service.validateJwtPayload({ sub: '1' })).toBeNull();
      expect(await service.validateJwtPayload({ username: 'u' })).toBeNull();
    });
  });
});
