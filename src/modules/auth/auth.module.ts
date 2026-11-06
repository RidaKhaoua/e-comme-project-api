import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // used to protect routes with JWT authentication
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') ?? 'default_secret_key',
        signOptions: {
          expiresIn: configService.get<number>('jwt.expiresIn') ?? 900,
        },
      }),
    }), // used to generate and verify JWT tokens
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy, JWTAuthGuard, RefreshTokenGuard],
})
export class AuthModule { }
