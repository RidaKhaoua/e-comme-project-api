import { ApiProperty } from "@nestjs/swagger";


export class CategoryResponseDto {
    @ApiProperty({
        example: "45dfffg4d4-d445f74ffd-4dd4fdddfdff",
        description: "The unique identifier of the category"
    })
    id: string;

    @ApiProperty({
        example: "Electronics",
        description: "The name of the category",
    })
    name: string;

    @ApiProperty({
        example: "Devices and gadgets including phones, laptops and accessories",
        description: "A brief description of the category",
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        example: "Electronics",
        description: "The URL-friendly slug for the category",
        nullable: true
    })
    slug: string | null;

    @ApiProperty({
        example: "https://example.com/iamges/electronics.png",
        description: "URL of the category image",
        nullable: true
    })
    imageUrl: string | null

    @ApiProperty({
        example: true,
        description: "Indicates if the category is active",
        default: true,
    })
    isActive: boolean

    @ApiProperty({
        example: "2026-01-01T12:00:00Z",
        description: "The date and time when the category was created"
    })
    createdAt: Date;

    @ApiProperty({
        example: "2026-01-01T12:00:00Z",
        description: "The date and time when the category was last updated"
    })
    updatedAt: Date;

    @ApiProperty({
        example: 10,
        description: "the total number of products in the category",
    })
    productCount: number;

}