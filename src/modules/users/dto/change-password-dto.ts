import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";


export class changePasswordDto {
    @ApiProperty({
        description: "Current password of user",
        example: "Strong1@pass!",
        required: true
    })

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    currentPassword: string

    @ApiProperty({
        description: "New password of user",
        example: "Strong1@pass!",
        required: true,
        minLength: 8
    })

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        },
    )
    newPassword: string
}