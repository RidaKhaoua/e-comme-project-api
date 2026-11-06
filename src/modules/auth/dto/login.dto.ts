import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: "User email adress",
        example: "jhon.doe@example.com"
    })
    @IsEmail({}, { message: "Email is invalid" })
    @IsNotEmpty({ message: " Email is required" })
    email: string;
    @ApiProperty({
        description: "User password",
        example: "Strong1@ssword!"
    })
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    password: string;
}