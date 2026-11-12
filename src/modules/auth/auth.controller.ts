import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthResponseDto } from './dto/authResponse.dto.js';
import { GetUser } from '../../common/decorators/get-user-decorator.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Register a new user
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new user",
    description: 'Creates a new user account'
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registred',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 429,
    description: 'To Many Requests. Rate limit exceeded',
  })

  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT-refresh")
  @ApiOperation({
    summary: "Refresh access token",
    description: 'Generate a new access token using a valid refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'new access token generated successfully',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid Or expired refresh token"

  })
  @ApiResponse({
    status: 429,
    description: "To Many Requests. Rate limit exceeded"
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })
  async refresh(@GetUser("id") userId: string): Promise<AuthResponseDto> {
    return await this.authService.refreshTokens(userId)
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Logout user",
    description: "Logs out the user and invalidates the refresh token"
  })
  @ApiResponse({
    status: 200,
    description: "User successfully logged out"
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid or expired token"
  })
  @ApiResponse({
    status: 429,
    description: "To Many Requests. Rate limit exceeded"
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })
  // Logout user and invalidate refresh token.
  @UseGuards(JWTAuthGuard)
  async logout(@GetUser("id") userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: "User logged with successfully " }
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "User Login",
    description: "Authenticates a user and returns access and refresh tokens"
  })
  @ApiResponse({
    status: 200,
    description: "User login successfully"
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid validation"
  })
  @ApiResponse({
    status: 429,
    description: "To Many Requests. Rate limit exceeded"
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto)
  }

}
