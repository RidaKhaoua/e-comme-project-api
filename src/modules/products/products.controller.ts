import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductStockDto } from './dto/update-product-stock.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateProductDto })
  @ApiOperation({ summary: 'Create Product' })
  @ApiResponse({
    status: 200,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Sku already exists' })
  @ApiResponse({ status: 429, description: 'Rate limiting ' })
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    console.log(createProductDto);
    return await this.productsService.create(createProductDto);
  }

  /* Get all products */
  @Get()
  @ApiOperation({ summary: 'Get All Products' })
  @ApiResponse({
    status: 200,
    description: 'List of Products retrivied successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() querProductDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: { total: number; totalPages: number; page: number; limit: number };
  }> {
    return await this.productsService.findAll(querProductDto);
  }

  /* Get Produt by Id */
  @Get(':id')
  @ApiOperation({
    summary: 'Get Product By id',
  })
  @ApiResponse({
    status: 200,
    description: 'The Product  with the specified Id',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({ status: 429, description: 'Rate limiting ' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  /* Get Product By Sku */
  @Get('sku/:sku')
  @ApiOperation({
    summary: 'Get Product By Sku',
  })
  @ApiResponse({
    status: 200,
    description: 'The Product  with the specified Sku',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({ status: 429, description: 'Rate limiting ' })
  async findBySku(@Param('sku') sku: string): Promise<ProductResponseDto> {
    return await this.productsService.findBySku(sku);
  }

  /* Update Product By Admin */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update Product by Id - Admin Only',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Update the Product',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Sku is already exists.',
  })
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    console.log(updateProductDto);
    return await this.productsService.update(id, updateProductDto);
  }

  /* Update Stock of product */
  @Patch(':id/stock')
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description:
            'Stock adjustment (positive to add, negative tu sutract)',
          example: 10,
        },
      },
      required: ['quantity'],
    },
  })
  @ApiOperation({ summary: 'Update the stock of product - Admin Only' })
  @ApiResponse({ status: 200, description: 'Stock updated with successfully' })
  @ApiResponse({ status: 400, description: 'Insuffisient stockt' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateStock(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity:number,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateStock(id, quantity);
  }

  /* Delete Product by admin */
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 403, description: 'forbiden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiOperation({ summary: 'Delete Product - Admin Only' })
  @ApiResponse({ status: 200, description: 'Product delete with successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 429, description: 'Rate limiting' })
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
