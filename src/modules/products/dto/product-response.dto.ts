import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/client';


export class ProductResponseDto {
  @ApiProperty({
    example: '41d42f7e-16c4-40c5-986c-6a20e6041867',
    description: 'The ID of the product',
  })
  id: string;

  @ApiProperty({
    example: 'Product 1',
    description: 'The name of the product',
  })
  name: string;

  @ApiProperty({
    example: 'Product 1 description',
    description: 'The description of the product',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 100.0,
    description: 'The price of the product',
  })
  price: number;

  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
  })
  stock: number;

  @ApiProperty({
    example: 'hhhfhdjdhf-dhdhdhhf-dhdhdhfhfh-dhdhdhd',
    description: 'The ID of the category',
  })
  categoryId: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'The Name of the category',
  })
  category: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'The image of the product',
  })
  imageUrl: string | null;

  @ApiProperty({
    example: 'WH-001',
    description: 'The SKU of the product',
  })
  sku: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether the product is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'The date and time the product was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'The date and time the product was updated',
  })
  updatedAt: Date;
}
