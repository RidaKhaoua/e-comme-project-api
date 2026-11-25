import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'The payment ID',
  })
  @IsString()
  @IsNotEmpty({ message: 'paymentId is required' })
  paymentIntentId: string;

  @ApiProperty({
    description: 'The order ID',
  })
  @IsString()
  @IsNotEmpty({ message: 'orderId is required' })
  orderId: string;
}
