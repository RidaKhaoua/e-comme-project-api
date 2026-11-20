import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @ApiProperty({
    example: 100,
    description: 'the quantity of OrderItems',
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: 99.99,
    description: 'the price of OrderItems',
    required: true,
  })
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Price muste be a valid number (e.g, 49.99)',
    },
  )
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 'fjddhhdhdh-ddhdhdhdhd-dhdddhdhd-shsgddd',
    description: 'the productId',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    example: '45 Street Jhon',
    description: 'The shippingAdress of Order',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  shippingAdress: string;
}
