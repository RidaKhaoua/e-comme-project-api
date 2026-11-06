import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { changePasswordDto } from "./dto/change-password-dto.js";
import * as bcrypt from "bcrypt";
@Injectable()

export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }
    private readonly SALT_ROUNDS = 12;
    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                lastName: true,
                firstName: true,
                role: true,
                password: false,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (!user) {
            throw new NotFoundException("User Not found");
        }
        return user
    }

    async findAll(): Promise<UserResponseDto[]> {
        return this.prisma.user.findMany({
            where: {
                isArchived: false,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                password: false,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const userExist = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            }
        })
        if (!userExist) {
            throw new NotFoundException("User not found")
        }

        if (updateUserDto.email && updateUserDto.email !== userExist.email) {
            const emailTaken = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email }
            })
            if (emailTaken) {
                throw new NotFoundException("Email is already taken");
            }
        }
        const updatUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateUserDto
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                password: false,
                createdAt: true,
                updatedAt: true
            }
        })

        return updatUser

    }

    async updatePassword(id: string, changePasswordDto: changePasswordDto): Promise<{ message: string }> {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            select: {
                password: true
            }
        })

        if (!existingUser) {
            throw new NotFoundException("User not found")
        }

        const isValidPassword = await bcrypt.compare(changePasswordDto.currentPassword, existingUser.password);
        if (!isValidPassword) {
            throw new NotFoundException("currentPassword is incorrect")
        }
        const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, existingUser.password);
        if (isSamePassword) {
            throw new NotFoundException("New password be different from the current password")
        }
        const hashPassword = await bcrypt.hash(changePasswordDto.newPassword, this.SALT_ROUNDS)
        await this.prisma.user.update({
            where: { id },
            data: {
                password: hashPassword
            }
        })

        return { message: "Password update with success" }
    }

    async delete(id: string): Promise<{ message: string }> {
        await this.findOne(id);

        await this.prisma.user.update({
            where: { id },
            data: {
                isArchived: true,
                refreshToken: null,
                deletedAt: new Date()
            }
        })

        return { message: "User Deleted with successfuly" }
    }

}