import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategorieDto {

    @ApiProperty({
        example: "Electronics",
        description: "The name of the category",
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty({ message: "Category Name is required" })
    @MaxLength(100)
    name: string;

    @ApiProperty({
        example: "Devices and gadgets including phones, laptops and accessories",
        description: "A brief description of the category",
        maxLength: 200,
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @ApiProperty({
        example: "Electronics",
        description: "The URL-friendly slug for the category",
        required: false,
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    slug: string;

    @ApiProperty({
        example: "https://example.com/iamges/electronics.png",
        description: "URL of the category image",
        required: false,
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    imageUrl?: string

    @ApiProperty({
        example: true,
        description: "Indicates if the category is active",
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}