import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateCategorieDto } from "./dto/create-categorie.dto.js";
import { CategoryResponseDto } from "./dto/category-response.dto.js";
import { QueryCategoryDto } from "./dto/query-category.dto.js";
import { Categories, Prisma } from "@prisma/client";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(createCategorieDto: CreateCategorieDto): Promise<CategoryResponseDto> {
        const categorySlug = createCategorieDto.slug ?? createCategorieDto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const isExsitingCategory = await this.prisma.categories.findUnique({
            where: { slug: categorySlug }
        });

        if (isExsitingCategory) {
            throw new Error("Category with this slug already exists: " + categorySlug);
        }

        const category = await this.prisma.categories.create({
            data: {
                ...createCategorieDto
            }
        })

        return this.formatCategory(category, 0)
    }

    async findAll(queryDto: QueryCategoryDto): Promise<CategoryResponseDto[]> {
        const page = Number(queryDto.page) || 1;
        const limit = Number(queryDto.limit) || 10;
        const skip = (page - 1) * limit;

        const categories = await this.prisma.categories.findMany({
            where: { ...this.filtrationQuery(queryDto) },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        return categories.map(cat => this.formatCategory(cat, cat._count.products));
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        const categorie = await this.prisma.categories.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        })

        if (!categorie) {
            throw new NotFoundException("Category not found");
        }


        return this.formatCategory(categorie, categorie?._count.products)
    }

    async findByslug(slug: string): Promise<CategoryResponseDto> {
        const categorie = await this.prisma.categories.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        })

        if (!categorie) {
            throw new NotFoundException("Category not found");
        }


        return this.formatCategory(categorie, categorie?._count.products)
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const isExsitingCategory = await this.findOne(id);
        if (updateCategoryDto?.slug && isExsitingCategory.slug !== updateCategoryDto.slug) {
            const slugIsExist = await this.prisma.categories.findUnique({
                where: { slug: updateCategoryDto.slug }
            });
            if (slugIsExist) {
                throw new ConflictException("Category with this slug already exists: " + slugIsExist.slug);
            }
        }

        const updateCategory = await this.prisma.categories.update({
            where: { id },
            data: {
                ...updateCategoryDto
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    }
                }
            }
        })
        return this.formatCategory(updateCategory, updateCategory._count.products)
    }

    async delete(id: string): Promise<{ message: string }> {
        const category = await this.findOne(id);
        if (category.productCount > 0) {
            throw new BadRequestException(`Cannot delete category ${category.productCount} products. Remove or reassing first.`)
        }
        await this.prisma.categories.delete({
            where: { id }
        })
        return { message: "Category deleted with successfully" }
    }

    async count(queryDto: QueryCategoryDto): Promise<number> {
        return await this.prisma.categories.count({
            where: this.filtrationQuery(queryDto)
        });
    }

    private filtrationQuery(queryDto: QueryCategoryDto) {
        const { search, isActive } = queryDto;
        const where: Prisma.CategoriesWhereInput = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.OR = [
                {
                    name: { contains: search, mode: "insensitive" }
                },
                {
                    description: { contains: search, mode: "insensitive" }
                }
            ]
        }
        return where
    }

    private formatCategory(categorie: Categories, procuctCount: number) {
        return {
            id: categorie.id,
            name: categorie.name,
            description: categorie.description,
            slug: categorie.slug,
            imageUrl: categorie.imageUrl,
            isActive: categorie.isActive,
            createdAt: categorie.createdAt,
            updatedAt: categorie.updatedAt,
            productCount: procuctCount,
        }
    }

}