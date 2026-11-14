import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { Categories, Prisma, Product } from '@prisma/client';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateProductStockDto } from './dto/update-product-stock.dto.js';
@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const isSkuExists = await this.prisma.product.findUnique({
      where: {
        sku: createProductDto.sku,
      },
    });
    if (isSkuExists) {
      throw new ConflictException('Product already exists');
    }
    const isCategoryExists = await this.prisma.categories.findUnique({
      where: {
        id: createProductDto.categoryId,
      },
    });
    if (!isCategoryExists) {
      throw new NotFoundException('Category not found');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        price: new Prisma.Decimal(createProductDto.price),
      },
      include: {
        category: true,
      },
    });
    return this.formatProduct(product);
  }

  async findAll(
    queryProductDto: QueryProductDto,
  ): Promise<ProductResponseDto[]> {
    const page = Number(queryProductDto.page) || 1;
    const limit = Number(queryProductDto.limit) || 1;
    const skip = (page - 1) * limit;

    const products = await this.prisma.product.findMany({
      where: { ...this.filtration(queryProductDto) },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });

    return products.map((product) => this.formatProduct(product));
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
        isArchived: false,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product Not Found');
    }

    return this.formatProduct(product);
  }

  async findBySku(sku: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: {
        sku,
        isArchived: false,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product Not Found');
    }

    return this.formatProduct(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const isExistProduct = await this.findOne(id);

    if (updateProductDto.sku && isExistProduct.sku !== updateProductDto.sku) {
      const isSkuExists = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (isSkuExists) {
        throw new ConflictException('The Sku is already exists');
      }
    }
    if (
      updateProductDto.categoryId &&
      isExistProduct.categoryId !== updateProductDto.categoryId
    ) {
      const isCategoryExists = await this.prisma.categories.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!isCategoryExists) {
        throw new NotFoundException('Category not found');
      }
    }
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(updateProductDto.price && {
          price: new Prisma.Decimal(updateProductDto.price),
        }),
      },
      include: {
        category: true,
      },
    });
    return this.formatProduct(product);
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    const isExistProduct = await this.findOne(id);
    const newStock = isExistProduct.stock + Number(quantity);
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
      },
      include: {
        category: true,
      },
    });
    return this.formatProduct(product);
  }

  async delete(id: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        OrderItems: true,
        CartItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.OrderItems.length > 0) {
      throw new BadRequestException(
        'Cannot delete Product that is part of existing orders. Consider marking it as inactive only.',
      );
    }
    if (product.CartItems.length > 0) {
      throw new BadRequestException(
        'Cannot delete Product that is part of existing cartItems. Consider marking it as inactive only.',
      );
    }
    await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        isArchived: true,
      },
    });
    return { message: 'Product delete with successfully' };
  }

  async count(queryProductDto: QueryProductDto): Promise<number> {
    return await this.prisma.product.count({
      where: { ...this.filtration(queryProductDto) },
    });
  }

  private formatProduct(
    product: Product & { category: Categories },
  ): ProductResponseDto {
    return {
      ...product,
      price: Number(product.price),
      category: product.category.name,
    };
  }

  private filtration(queryProductDto: QueryProductDto) {
    const { isActive, search, category } = queryProductDto;
    const where: Prisma.ProductWhereInput & Prisma.CategoriesWhereInput = {
      isArchived: false,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }
    if (category) {
      where.category = { name: { contains: category, mode: 'insensitive' } };
    }
    return where;
  }
}
