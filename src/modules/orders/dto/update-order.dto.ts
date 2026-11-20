import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";


export class UpdateOrderDto  {
    @ApiProperty({
        example: 'PENDING',
        required: false,
        description: 'Order Status',
      })
      @IsOptional()
      @IsEnum(OrderStatus)
      status?: OrderStatus;
    
      @ApiProperty({
        example: 'FH-745',
        description: 'the orderNumber',
        required:false
      })
      @IsOptional()
      @IsString()
      orderNumber?: string;
}
