import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'hsjhd4slhfj-fhsshfssf-sfhdlsfks',
    description: 'The OrderId of Order',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'OrderId is required' })
  orderId: string;

  @ApiProperty({
    example: 99.99,
    description: 'The Amount of order',
    minimum: 0,
    required: true,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    example: 'usd',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency: string = 'usd';

 
}
