import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates administrator credentials and issues a JWT access token.
   * Uses a generic "Invalid email or password" message on failure to avoid
   * leaking whether a given email is registered (user enumeration).
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });

    if (!admin) {
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, admin.password);
    if (!passwordMatches) {
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: admin.id, email: admin.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    this.logger.log(`Administrator ${admin.email} logged in successfully`);

    return {
      accessToken,
      admin: { id: admin.id, email: admin.email, fullName: admin.fullName },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('Administrator account no longer exists');
    }
    return { id: admin.id, email: admin.email, fullName: admin.fullName };
  }
}
