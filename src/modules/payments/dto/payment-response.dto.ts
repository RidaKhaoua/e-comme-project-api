import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';


export class PaymentResponseDto {
  @ApiProperty({
    example: 'hfjhfhfh4j-shsjsfhsgf-hshfshfjs',
    description: 'The ID of payment',
  })
  id: string;

  @ApiProperty({
    example: 'hdjslqueo-hdks455djdhf-5qfjqhhdd',
    description: 'The ID of Order',
  })
  orderId: string;

  @ApiProperty({
    example: 'hdjslqueo-hdks455djdhf-5qfjqhhdd',
    description: 'The ID of user',
  })
  userId: string;

  @ApiProperty({
    example: 99.99,
    description: 'The Amount of Order',
  })
  amount: number;

  @ApiProperty({
    example: 'usd',
    description: 'The currency of payment',
  })
  currency: string;

  @ApiProperty({
    example: 'COMPLETED',
    description: 'The Status of payment',
    enum: [
      PaymentStatus.PENDING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ],
  })
  status: PaymentStatus;

  @ApiPropertyOptional({
    example: 'STRIPE',
    nullable: true,
  })
  paymentMethode: string | null;

  @ApiPropertyOptional({
    example: 'pi_1142558741',
    nullable: true,
  })
  transationId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreatePaymentResponseDto {
  @ApiProperty({
    example: 'pi_14741144174',
    description: 'Stripe client secret for payment confirmation',
  })
  clientSecret: string | null;

  @ApiProperty({
    example: '44122144-4514455-247885542',
    description: 'Payment ID in database',
  })
  paymentId: string;
}

export class PaymentResponseApiDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    type: PaymentResponseDto,
  })
  data: PaymentResponseDto;

  @ApiPropertyOptional({
    example: 'Payment intent created with successfully',
    required: false,
  })
  message?: string;
}

export class CreatePaymentResponseApiDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    type: CreatePaymentResponseDto,
  })
  data: CreatePaymentResponseDto;

  @ApiPropertyOptional({
    example: 'Payment intent created with successfully',
    required: false,
  })
  message?: string;
}
