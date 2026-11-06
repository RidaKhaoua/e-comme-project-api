import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import type { RequestWithUser } from '../../common/interfaces/request-with-user-interface.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { GetUser } from '../../common/decorators/get-user-decorator.js';
import { changePasswordDto } from './dto/change-password-dto.js';
import { Role } from '@prisma/client';

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@UseGuards(JWTAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /* users/me */
  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "The current user profile",
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    return await this.usersService.findOne(req.user.id);
  }

  /* /users */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto]
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized"
  })
  @ApiResponse({
    status: 429,
    description: "Rate limiting "
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error"
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  /* /users/:id */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "User By Id"
  })
  @ApiResponse({
    status: 200,
    description: "The user with the specified Id",
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "unAuthorized"
  })
  @ApiResponse({
    status: 404,
    description: "User not found"
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.findOne(id);
  }

  /* update users/me */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update current user Profile"
  })
  @ApiResponse({
    status: 200,
    description: "The updated user profile",
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized"
  })
  async update(@GetUser("id") id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change current user password'
  })
  @ApiResponse({
    status: 200,
    description: "Password changed successfully"
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized"
  })
  async changePassword(@GetUser("id") id: string, @Body() changePasswordDto: changePasswordDto): Promise<{ message: string }> {
    return await this.usersService.updatePassword(id, changePasswordDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete current user account" })
  @ApiResponse({ status: 200, description: "User account deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })

  async deleteAccount(@GetUser("id") id: string): Promise<{ message: string }> {
    return await this.usersService.remove(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete current user account by admin" })
  @ApiResponse({ status: 200, description: "User account deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })

  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersService.remove(id);
  }
}
