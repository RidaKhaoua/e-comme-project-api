import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive, Min } from 'class-validator';

export class UpdateProductStockDto {
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
}
