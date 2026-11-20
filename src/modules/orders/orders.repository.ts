import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dto/orders-response.dto.js';
import {
  Order,
  OrderItems,
  OrderStatus,
  Prisma,
  Product,
  User,
} from '@prisma/client';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const { items, shippingAdress } = createOrderDto;

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested:${item.quantity}`,
        );
      }
    }

    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    //Check if the User confirmed The Order.
    const latestCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        checkedOut: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = tx.order.create({
        data: {
          userId,
          totalAmount: total,
          status: OrderStatus.PENDING,
          cartId: latestCart?.id,
          shippingAddress: shippingAdress,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return newOrder;
    });

    return this.formatOrderApi(order);
  }

  async findAllForAdmin(
    queryOrderDto: QueryOrderDto,
  ): Promise<OrderResponseDto[]> {
    const page = Number(queryOrderDto.page) || 1;
    const limit = Number(queryOrderDto.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await this.prisma.order.findMany({
      where: { ...this.filtrationOrders(queryOrderDto, true) },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async findAll(
    queryOrderDto: QueryOrderDto,
    userId: string,
  ): Promise<OrderResponseDto[]> {
    const page = Number(queryOrderDto.page) || 1;
    const limit = Number(queryOrderDto.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await this.prisma.order.findMany({
      where: { ...this.filtrationOrders(queryOrderDto), userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async findOne(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const order = await this.prisma.order.findFirst({
      where: { id, ...(userId && { userId }) },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`The Order with ID ${id} not found`);
    }

    return this.formatOrderApi(order);
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    await this.findOne(id, userId);
    if (updateOrderDto.status === 'CANCELLED') {
      return await this.cancel(id);
    }
    const updateOrder = await this.prisma.order.update({
      where: { id, ...(userId && { userId }) },
      data: { ...updateOrderDto },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return this.formatOrderApi(updateOrder);
  }

  async cancel(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const exesting = await this.findOne(id, userId);

    if (exesting.data.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      for (const orderItem of exesting.data.items) {
        await tx.product.update({
          where: { id: orderItem.productId },
          data: { stock: { increment: orderItem.quantity } },
        });
      }
      const cancelOrder = await this.prisma.order.update({
        where: { id, ...(userId && { userId }) },
        data: {
          status: 'CANCELLED',
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return cancelOrder;
    });
    return this.formatOrderApi(cancelled);
  }

  async countForAdmin(queryOrderDto: QueryOrderDto): Promise<number> {
    return await this.prisma.order.count({
      where: { ...this.filtrationOrders(queryOrderDto) },
    });
  }

  async count(queryOrderDto: QueryOrderDto, userId: string): Promise<number> {
    return await this.prisma.order.count({
      where: { ...this.filtrationOrders(queryOrderDto), userId },
    });
  }

  private filtrationOrders(
    queryOrderDto: QueryOrderDto,
    filterByAdmin?: boolean,
  ) {
    const where: Prisma.OrderWhereInput = {};

    if (queryOrderDto.status) {
      where.status = queryOrderDto.status;
    }

    if (queryOrderDto.search) {
      where.OR = [
        {
          id: { contains: queryOrderDto.search, mode: 'insensitive' },
        },
        {
          ...(filterByAdmin && {
            orderNumber: {
              contains: queryOrderDto.search,
              mode: 'insensitive',
            },
          }),
        },
      ];
    }

    return where;
  }

  private formatOrderApi(
    order: Order & {
      orderItems: (OrderItems & { product: Product })[];
      user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      };
    },
  ) {
    return {
      success: true,
      data: {
        ...order,
        totalAmount: Number(order.totalAmount),
        items: order.orderItems.map((orderItem) => ({
          id: orderItem.id,
          quantity: orderItem.quantity,
          price: Number(orderItem.price),
          subtotal: Number(orderItem.price) * Number(orderItem.quantity),
          productId: orderItem.productId,
          productName: orderItem.product.name,
          createdAt: orderItem.createdAt,
          updatedAt: orderItem.updatedAt,
        })),
        ...(order.user && {
          userEmail: order.user.email,
          userName: `${order.user.firstName} ${order.user.lastName}`,
        }),
      },
    };
  }

  private formatOrder(
    order: Order & {
      orderItems: (OrderItems & { product: Product })[];
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      };
    },
  ) {
    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.orderItems.map((orderItem) => ({
        id: orderItem.id,
        quantity: orderItem.quantity,
        price: Number(orderItem.price),
        subtotal: Number(orderItem.price) * Number(orderItem.quantity),
        productName: orderItem.product.name,
        productId: orderItem.productId,
        createdAt: orderItem.createdAt,
        updatedAt: orderItem.updatedAt,
      })),
      ...(order.user && {
        userEmail: order.user.email,
        userName: `${order.user.firstName} ${order.user.lastName}`,
      }),
    };
  }
}
