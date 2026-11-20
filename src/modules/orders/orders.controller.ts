import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
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
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import {
  ModerateThrottle,
  RelaxedrateThrottle,
} from '../../common/decorators/custom-throttler.decorators.js';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dto/orders-response.dto.js';
import { GetUser } from '../../common/decorators/get-user-decorator.js';
import { QueryOrderDto } from './dto/query-order.dto.js';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JWTAuthGuard, RoleGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ModerateThrottle()
  @ApiOperation({ summary: 'Create an Order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description: 'Order created successfully.',
    type: OrderApiResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or insufficient stock.',
  })
  @ApiNotFoundResponse({
    description: 'Cart not found or empty.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limiting exceeded.',
  })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.create(createOrderDto, userId);
  }

  // Get all orders by Admin
  @Get('admin/all')
  @Roles(Role.ADMIN)
  @RelaxedrateThrottle()
  @ApiOperation({ summary: '[ADMIN] Get all orders (paginated)' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'list of orders',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        items: { $ref: getSchemaPath(OrderResponseDto) },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            totalPages: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({ description: 'The resource is accessible by Admin' })
  async findAllForAdmin(@Query() queryOrderDto: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    meta: { total: number; totalPages: number; page: number; limit: number };
  }> {
    return await this.ordersService.findAllForAdmin(queryOrderDto);
  }

  // Get all orders of User
  @Get()
  @Roles(Role.USER)
  @RelaxedrateThrottle()
  @ApiOperation({ summary: 'Get all orders (paginated)' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'list of orders',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        items: { $ref: getSchemaPath(OrderResponseDto) },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            totalPages: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async findAll(
    @Query() queryOrderDto: QueryOrderDto,
    @GetUser('id') userId: string,
  ): Promise<{
    data: OrderResponseDto[];
    meta: { total: number; totalPages: number; page: number; limit: number };
  }> {
    return await this.ordersService.findAll(queryOrderDto, userId);
  }

  //Get Order For Admin
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get Order by id - Admin Only' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({ description: 'Get Order Details.', type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Admin acess required' })
  @ApiUnauthorizedResponse({ description: 'Authantification required' })
  @RelaxedrateThrottle()
  @Roles(Role.ADMIN)
  async findOneByAdmin(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  //Get Order
  @Get(':id')
  @ApiOperation({ summary: 'Get an Order by id for current user' })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Get Order Details.',
    type: OrderApiResponseDto<OrderResponseDto>,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Authantification required' })
  @RelaxedrateThrottle()
  @Roles(Role.USER)
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.ordersService.findOne(id, userId);
  }
  // Admin update order
  @Patch('admin/:id')
  @ApiOperation({ summary: 'Update any order - Admin only' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({ type: OrderApiResponseDto<OrderResponseDto> })
  @ApiForbiddenResponse({ description: 'Admin acess required' })
  @ApiUnauthorizedResponse({ description: 'Authantification required.' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ModerateThrottle()
  async updateForAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    return await this.ordersService.update(id, updateOrderDto);
  }

  // User update  own order
  // @Patch(':id')
  // @ApiOperation({ summary: 'Update User own order' })
  // @ApiParam({ name: 'id', description: 'Order ID' })
  // @ApiBody({
  //   type: UpdateOrderDto,
  // })
  // @ApiOkResponse({ type: OrderApiResponseDto<OrderResponseDto> })
  // @ApiUnauthorizedResponse({ description: 'Authantification required.' })
  // @ApiNotFoundResponse({ description: 'Order not found' })
  // @ModerateThrottle()
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateOrderDto: UpdateOrderDto,
  //   @GetUser('id') userId: string,
  // ): Promise<OrderApiResponseDto<OrderResponseDto>> {
  //   return await this.ordersService.update(id, updateOrderDto, userId);
  // }

  // Admin Delete Order
  @Delete('admin/:id')
  @ApiOperation({ summary: 'Cancel order - Admin Only' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order Cancelled with successfully',
    type: OrderApiResponseDto<OrderResponseDto>,
  })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiUnauthorizedResponse({ description: 'Authantification required.' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ModerateThrottle()
  cancelOrderByAdmin(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }

  // Admin Delete Order
  @Delete(':id')
  @ApiOperation({ summary: 'User Cancel own order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order Deleted with successfully',
    type: OrderApiResponseDto<OrderResponseDto>,
  })
  @ApiUnauthorizedResponse({ description: 'Authantification required.' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ModerateThrottle()
  cancel(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.ordersService.cancel(id, userId);
  }
}
