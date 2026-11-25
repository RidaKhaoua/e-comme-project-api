import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreatePaymentResponseApiDto,
  PaymentResponseApiDto,
  PaymentResponseDto,
} from './dto/payment-response.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentRepository {
  private stripe: Stripe;
  constructor(private readonly prisma: PrismaService, private readonly configService:ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow("STRIPE_SECRET_KEY"), {
      apiVersion: '2026-11-18.endive',
    });
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<CreatePaymentResponseApiDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: createPaymentDto.orderId, userId },
      select: {
        id: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${createPaymentDto.orderId} nor found`,
      );
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: createPaymentDto.orderId },
    });

    if (existingPayment && existingPayment.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('payment already completed for this order');
    }

    const paymentStripe = await this.stripe.paymentIntents.create({
      amount: Math.round(createPaymentDto.amount * 100),
      currency: createPaymentDto.currency,
      metadata: { orderId: createPaymentDto.orderId, userId },
    });

    await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        amount: new Prisma.Decimal(createPaymentDto.amount),
        userId,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        transactionId: paymentStripe.id,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentStripe.client_secret,
        paymentId: paymentStripe.id,
      },
    };
  }

  async findAll(userId: string): Promise<{
    success: boolean;
    data: PaymentResponseDto[];
    message: string;
  }> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: payments.map((payment) => this.mapToPaymentResponse(payment)),
      message: 'Payments retrieved successfully',
    };
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return {
      success: true,
      data: this.mapToPaymentResponse(payment),
      message: 'Payments retrieved successfully',
    };
  }

  async findByOrder(
    orderId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto | null;
    message: string;
  }> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId, userId },
    });

    return {
      success: true,
      data: payment ? this.mapToPaymentResponse(payment) : null,
      message: 'Payment retrieved with successfully',
    };
  }
  async confirmPayment(
    confirmPaymentDto: ConfirmPaymentDto,
    userId: string,
  ): Promise<PaymentResponseApiDto> {
    const { paymentIntentId, orderId } = confirmPaymentDto;

    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        userId,
        transactionId: paymentIntentId,
      },
    });

    if (!payment) {
      throw new NotFoundException('The payment not found');
    }

    if (payment.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('Payment already completed');
    }

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    const [updatePayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: PaymentStatus.COMPLETED },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      }),
    ]);

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (order?.cartId) {
      await this.prisma.cart.update({
        where: { id: order.cartId },
        data: { checkedOut: true },
      });
    }

    return {
      success: true,
      data: this.mapToPaymentResponse(updatePayment),
      message: 'Confirm payment success',
    };
  }

  private mapToPaymentResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      paymentMethode: payment.paymentMethod,
      status: payment.paymentStatus,
      transationId: payment.transactionId,
      orderId: payment.orderId,
      userId: payment.userId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
