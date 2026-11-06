import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

export class UserResponseDto {
    @ApiProperty({ description: "User Id", example: "1267hhddj-e9ikj-123-hdhd-17637676364" })
    id: string;

    @ApiProperty({ description: "User email adress", example: "user@example.com" })
    email: string;

    @ApiProperty({ description: "User firstName", example: "Jhon", nullable: true })
    firstName: string | null;

    @ApiProperty({ description: "User lasttName", example: "Doe", nullable: true })
    lastName: string | null;

    @ApiProperty({ description: "User rolee", enum: Role })
    role: Role;

    @ApiProperty({ description: "account create date", example: "2023-10-15T12:32:56.9878Z" })
    createdAt: Date

    @ApiProperty({ description: "last account update date", example: "2023-10-15T12:32:56.9878Z" })
    updatedAt: Date


}