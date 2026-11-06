import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserRepository } from './user.repository.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
})
export class UsersModule { }
