import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Product 1',
    required: true,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Product 1 description',
    required: false,
    nullable: true,
    maximum: 255,
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 99.99,
    description: 'The price of the product',
    required: true,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Price is required' })
  @IsPositive({ message: 'Price must be a positive number' })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
    required: true,
    minimum: 0,
  })
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty({ message: 'Stock is required' })
  @IsPositive({ message: 'Stock must be a positive number' })
  stock: number;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'The Id of the category',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'The image of the product',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'] },
    { message: 'Image URL must be a valid URL' },
  )
  imageUrl?: string;

  @ApiProperty({
    example: 'WH-001',
    description: 'Stock keeping Unit (Sku) -unique identifier',
    uniqueItems: true,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the product is active and available for purchase',
    required: false,
    default:true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
