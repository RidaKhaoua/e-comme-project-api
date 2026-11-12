import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthResponseDto } from './dto/authResponse.dto.js';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) { }
  private readonly SALT_ROUNDS = 12;

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: false,
        firstName: true,
        lastName: true,
      },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
      const user = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: false,
        },
      });
      const tokens = await this.generateToken(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return {
        ...tokens,
        user,
      };
    } catch (error) {
      console.log("Error during user registration:", error);
      throw new InternalServerErrorException('Error during user registration');
    }
  }

  async refreshTokens(userId: string): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: false
      }
    });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const tokens = await this.generateToken(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refreshToken)
    return {
      ...tokens,
      user
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },

    })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.isArchived) {
      throw new NotFoundException("User not found")
    }
    const tokens = await this.generateToken(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }
  }

  async logout(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: ({ id: userId }),
      data: { refreshToken: null }
    })
  }

  private async generateToken(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync({ ...payload, refreshId }, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
