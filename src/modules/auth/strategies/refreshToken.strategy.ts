import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret') ?? 'default_refresh_secret',
      passReqToCallback: true,
    });


  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    console.log('RefreshTokenStrategy validate called with payload:', payload);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    const refreshToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is not available after removing Bearer prefix',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        refreshToken: true,
        password: false,
      },
    });

    if (!user || user.refreshToken === null) {
      throw new UnauthorizedException(
        'User not found or refresh token is missing',
      );
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh does not match');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
