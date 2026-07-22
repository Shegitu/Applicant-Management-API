import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { admin: { findUnique: jest.Mock } };
  let jwtService: { signAsync: jest.Mock };

  const mockAdmin = {
    id: 'admin-uuid-1',
    email: 'admin@infnova.com',
    fullName: 'System Administrator',
    password: '',
  };

  beforeEach(async () => {
    mockAdmin.password = await bcrypt.hash('Admin123!', 10);

    prisma = { admin: { findUnique: jest.fn() } };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => ({ 'jwt.secret': 'test-secret', 'jwt.expiresIn': '1d' })[key] },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('returns an access token and admin profile for valid credentials', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);

      const result = await service.login({ email: mockAdmin.email, password: 'Admin123!' });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.admin).toEqual({
        id: mockAdmin.id,
        email: mockAdmin.email,
        fullName: mockAdmin.fullName,
      });
    });

    it('throws UnauthorizedException when the email does not exist', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'nobody@example.com', password: 'whatever1' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the password is incorrect', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);

      await expect(service.login({ email: mockAdmin.email, password: 'WrongPass1' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('returns the admin profile for a valid id', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);

      const result = await service.getProfile(mockAdmin.id);

      expect(result).toEqual({ id: mockAdmin.id, email: mockAdmin.email, fullName: mockAdmin.fullName });
    });

    it('throws UnauthorizedException when the admin no longer exists', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
