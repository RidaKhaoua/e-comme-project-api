import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import {
  CreatePaymentResponseApiDto,
  PaymentResponseApiDto,
  PaymentResponseDto,
} from './dto/payment-response.dto.js';
import { StrictThrottle } from '../../common/decorators/custom-throttler.decorators.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { GetUser } from '../../common/decorators/get-user-decorator.js';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto.js';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JWTAuthGuard, RoleGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Create a payment intent for an order',
  })
  @ApiBody({
    type: CreatePaymentDto,
  })
  @ApiCreatedResponse({
    description: 'Payment intent create successfully',
    type: CreatePaymentResponseApiDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentification required',
  })
  @ApiBadRequestResponse({
    description: 'invalid data or order not found',
  })
  @ApiNotFoundResponse({ description: 'Order Not found' })
  @StrictThrottle()
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentDto,
    @GetUser('id') userId: string,
  ): Promise<CreatePaymentResponseApiDto> {
    return await this.paymentsService.create(createPaymentIntentDto, userId);
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm payment',
    description: 'Confirm a payment intent for an order',
  })
  @ApiBody({
    type: ConfirmPaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
    type: PaymentResponseApiDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment not found or already completed',
  })
  @ApiUnauthorizedResponse({ description: 'Authentification required' })
  async confirmPayment(
    @Body() confirmPayment: ConfirmPaymentDto,
    @GetUser('id') userId: string,
  ) {
    return await this.paymentsService.confirmPayment(confirmPayment, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Payment for current User' })
  @ApiResponse({
    status: 200,
    type: PaymentResponseApiDto,
  })
  @ApiForbiddenResponse({ description: 'Authentification is required' })
  @ApiUnauthorizedResponse({ description: 'Authentification required' })
  async findAll(@GetUser('id') userId: string): Promise<{
    success: boolean;
    data: PaymentResponseDto[];
    message: string;
  }> {
    return await this.paymentsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific Payment for current User' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'dhflkkdjhssjf4fsl-sfhlhkhsjhhskf-s:hfjfhfhskjf',
  })
  @ApiOkResponse({
    description: 'Payment retrieved successfully',
    type: PaymentResponseApiDto,
  })
  @ApiUnauthorizedResponse({ description: 'Authentification required' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<PaymentResponseApiDto> {
    return await this.paymentsService.findOne(id, userId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get a specific Payment for current User' })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID',
    example: 'dhflkkdjhssjf4fsl-sfhlhkhsjhhskf-s:hfjfhfhskjf',
  })
  @ApiOkResponse({
    description: 'Payment retrieved successfully',
    type: PaymentResponseApiDto,
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiUnauthorizedResponse({ description: 'Authentification required' })
  async findByOrder(
    @Param('orderId') orderId: string,
    @GetUser('id') userId: string,
  ): Promise<PaymentResponseApiDto> {
    return await this.paymentsService.findByOrder(orderId, userId);
  }
}
