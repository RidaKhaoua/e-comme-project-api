import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";


export class UpdateUserDto {
    @ApiProperty({
        description: "User email adress",
        example: "jhon@gmail.com",
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string

    @ApiProperty({
        description: "User firstName",
        example: "Jhon",
        required: false
    })
    @IsOptional()
    @IsString()
    firstName?: string

    @ApiProperty({
        description: "User lasttName",
        example: "Doe",
        required: false
    })
    @IsOptional()
    @IsString()
    lastName?: string
}
