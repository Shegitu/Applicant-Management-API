import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Called automatically by Passport after the JWT signature/expiry is
   * verified. The returned value is attached to `request.user`.
   */
  async validate(payload: JwtPayload) {
    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });

    if (!admin) {
      throw new UnauthorizedException('Administrator account no longer exists');
    }

    return { id: admin.id, email: admin.email, fullName: admin.fullName };
  }
}
