import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successfull',
  })
  success: boolean;

  @ApiProperty({
    description: 'Returned data',
    type: Object,
  })
  data: T;

  @ApiPropertyOptional({
    description: 'Optional message',
    nullable: true,
    required: false,
  })
  message?: string | null;
}

class OrderItemResponseDto {
  @ApiProperty({
    example: 'hdshskfhshs-sshfshsfhs-shfkhskfhs-sshhsf',
    description: 'The ID of OrderItems',
  })
  id: string;

  @ApiProperty({
    example: 100,
    description: 'the quantity of OrderItems',
    required: true,
  })
  quantity: number;

  @ApiProperty({
    example: 99.99,
    description: 'the price of OrderItems',
    required: true,
  })
  price: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty({
    example: 'Phone',
    description: 'The ProductName',
  })
  productName: string;

  @ApiProperty({
    example: 'kdhflksjhf-shfskhkshf-shfskhfjs-shfjssfq',
    description: 'The ProductId',
  })
  productId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty({
    example: 'hfhshfkshs-shskfhskshf-shsfhsh-sjjfhsss',
    description: 'The ID of Order',
  })
  id: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'The status of Order',
  })
  status: OrderStatus;

  @ApiProperty({
    example: 99.99,
    description: 'the totalAmount of order',
  })
  totalAmount: number;

  @ApiPropertyOptional({
    example: '45 Street Jhon',
    description: 'The shippingAdress of Order',
    nullable: true,
  })
  shippingAddress: string | null;

  @ApiProperty({
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];

  @ApiPropertyOptional()
  userEmail?: string | null;

  @ApiPropertyOptional()
  userName?: string | null;
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
