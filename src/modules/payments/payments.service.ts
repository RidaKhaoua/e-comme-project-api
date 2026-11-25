import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payments.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  CreatePaymentResponseApiDto,
  PaymentResponseApiDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<CreatePaymentResponseApiDto> {
    return await this.paymentRepository.create(createPaymentDto, userId);
  }

  async findAll(userId: string): Promise<{
    success: boolean;
    data: PaymentResponseDto[];
    message: string;
  }> {
    return await this.paymentRepository.findAll(userId);
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    return await this.paymentRepository.findOne(id, userId);
  }

  async findByOrder(
    orderId: string,
    userId: string,
  ): Promise<PaymentResponseApiDto> {
    return await this.findByOrder(orderId, userId);
  }

  async confirmPayment(
    confirmPaymentDto: ConfirmPaymentDto,
    userId: string,
  ): Promise<PaymentResponseApiDto> {
    return await this.paymentRepository.confirmPayment(
      confirmPaymentDto,
      userId,
    );
  }
}
