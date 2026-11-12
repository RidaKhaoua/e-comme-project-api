import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleGuard } from '../../common/guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import { CreateCategorieDto } from './dto/create-categorie.dto.js';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags("Categories")
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @ApiBearerAuth("JWT-auth")
  @ApiBody({ type: CreateCategorieDto })
  @ApiOperation({ summary: "Create Category" })
  @ApiResponse({ status: 200, description: "Category created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "forbidden." })
  @ApiResponse({ status: 429, description: "Rate limiting " })
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createCategoryDto: CreateCategorieDto): Promise<CategoryResponseDto> {
    return await this.categoriesService.create(createCategoryDto)
  }

  @ApiOperation({
    summary: "Get all categories"
  })
  @ApiResponse({
    status: 200,
    description: "List of categories retrivied successfully",
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CategoryResponseDto' }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @Get()
  async findAll(@Query() query: QueryCategoryDto) {
    return await this.categoriesService.findAll(query);
  }

  @ApiOperation({
    summary: "Get category by ID"
  })
  @ApiResponse({
    status: 200,
    description: "Category details",
    type: CategoryResponseDto
  })

  @ApiResponse({
    status: 404,
    description: "Category not found"
  })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    console.log(id)
    return await this.categoriesService.findOne(id)
  }

  @ApiOperation({
    summary: "Get category by Slug"
  })
  @ApiResponse({
    status: 200,
    description: "Category details",
    type: CategoryResponseDto
  })

  @ApiResponse({
    status: 404,
    description: "Category not found"
  })
  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string): Promise<CategoryResponseDto> {
    return await this.categoriesService.findBySlug(slug)
  }

  @Patch(":id")
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update category"
  })
  @ApiBody({
    type: UpdateCategoryDto
  })
  @ApiResponse({
    status: 200,
    description: "Category updated with success",
    type: CategoryResponseDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "forbidden." })
  @ApiResponse({ status: 404, description: "Category nout found" })
  @ApiResponse({ status: 409, description: "Category slug already" })
  @ApiResponse({
    status: 429,
    description: "Rate limiting "
  })
  async update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    console.log(updateCategoryDto)
    return await this.categoriesService.update(id, updateCategoryDto)
  }


  @Delete(":id")
  @UseGuards(JWTAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: "Delete Category"
  })
  @ApiBearerAuth("JWT-auth")
  @ApiResponse({
    status: 200,
    description: "Category deleted with successfully"
  })
  @ApiResponse({
    status: 401,
    description: "UnAuthorized"
  })
  @ApiResponse({
    status: 403,
    description: "forbidden"
  })
  @ApiResponse({
    status: 404,
    description: "Category not found"
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: string): Promise<{ message: string }> {
    return this.categoriesService.delete(id)
  }
}
