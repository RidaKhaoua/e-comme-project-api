import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductRepository } from './product.repository.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductStockDto } from './dto/update-product-stock.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productRepository.create(createProductDto);
  }

  async findAll(queryProductDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      totalPages: number;
      page: number;
      limit: number;
    };
  }> {
    const { page, limit } = queryProductDto;
    const [products, total] = await Promise.all([
      this.productRepository.findAll(queryProductDto),
      this.productRepository.count(queryProductDto),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    return {
      data: products,
      meta: {
        total,
        totalPages,
        page,
        limit,
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    return await this.productRepository.findOne(id);
  }

  async findBySku(sku: string): Promise<ProductResponseDto> {
    return await this.productRepository.findBySku(sku);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productRepository.update(id, updateProductDto);
  }

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<ProductResponseDto> {
    return await this.productRepository.updateStock(id, quantity);
  }
  async remove(id: string): Promise<{ message: string }> {
    return await this.productRepository.delete(id);
  }
}
