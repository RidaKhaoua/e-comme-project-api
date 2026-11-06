import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserRepository } from './user.repository.js';
import { changePasswordDto } from './dto/change-password-dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) { }


  async findAll(): Promise<UserResponseDto[]> {
    return await this.userRepository.findAll();
  }

  async findOne(id: string): Promise<UserResponseDto> {
    return await this.userRepository.findOne(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  async updatePassword(id: string, changePasswordDto: changePasswordDto): Promise<{ message: string }> {
    return await this.userRepository.updatePassword(id, changePasswordDto)
  }

  async remove(id: string): Promise<{ message: string }> {
    return await this.userRepository.delete(id)
  }
}
