import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

/**
 * Lightweight e2e smoke test for the auth flow.
 *
 * This exercises the HTTP layer (routing, DTO validation, guards) with the
 * AuthService mocked, so it runs without requiring a live Neon/Postgres
 * connection. Full integration testing against a real database is expected
 * to be run in CI with a provisioned test database (see README).
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  const authServiceMock = {
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        Reflector,
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login rejects malformed payloads with 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
  });

  it('POST /api/auth/login returns a token for a valid payload', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'signed.jwt.token',
      admin: { id: '1', email: 'admin@infnova.com', fullName: 'System Administrator' },
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@infnova.com', password: 'Admin123!' })
      .expect(200);

    expect(response.body.accessToken).toBe('signed.jwt.token');
  });
});
