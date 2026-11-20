import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dto/orders-response.dto.js';
import { OrdersRepository } from './orders.repository.js';
import { QueryOrderDto } from './dto/query-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly orderRepository: OrdersRepository) {}
  create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return this.orderRepository.create(createOrderDto, userId);
  }

  async findAllForAdmin(queryOrderDto: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    meta: { total: number; totalPages: number; page: number; limit: number };
  }> {
    const { limit, page } = queryOrderDto;
    const [orders, total] = await Promise.all([
      this.orderRepository.findAllForAdmin(queryOrderDto),
      this.orderRepository.countForAdmin(queryOrderDto),
    ]);
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    return {
      data: orders,
      meta: {
        total,
        totalPages,
        page,
        limit,
      },
    };
  }

  async findAll(
    queryOrderDto: QueryOrderDto,
    userId: string,
  ): Promise<{
    data: OrderResponseDto[];
    meta: { total: number; totalPages: number; page: number; limit: number };
  }> {
    const { limit, page } = queryOrderDto;
    const [orders, total] = await Promise.all([
      this.orderRepository.findAll(queryOrderDto, userId),
      this.orderRepository.count(queryOrderDto, userId),
    ]);
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    return {
      data: orders,
      meta: {
        total,
        totalPages,
        page,
        limit,
      },
    };
  }

  async findOne(id: string, userId?: string) {
    return await this.orderRepository.findOne(id, userId);
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return await this.orderRepository.update(id, updateOrderDto, userId);
  }

  async cancel(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return await this.orderRepository.cancel(id, userId);
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
