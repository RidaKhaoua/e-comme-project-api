import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryOrderDto {
  @ApiPropertyOptional({
    example: 'PENDING',
    description: 'The status of order',
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'search by OrderId or OrderNumber',
  })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({
    example: '1',
    description: 'Number of items to return per page',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page = 1;

  @ApiProperty({
    example: '10',
    description: 'Number of items to return per page of pagination',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit = 10;
}
