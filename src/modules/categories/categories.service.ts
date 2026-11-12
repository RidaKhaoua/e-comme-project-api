import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './categories.repository.js';
import { CreateCategorieDto } from './dto/create-categorie.dto.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async create(createCategorieDto: CreateCategorieDto): Promise<CategoryResponseDto> {
        return await this.categoryRepository.create(createCategorieDto)
    }



    async findAll(queryDto: QueryCategoryDto): Promise<{ data: CategoryResponseDto[], meta: { total: number; page: number; limit: number; totalPages: number } }> {
        const page = Number(queryDto.page) || 1;
        const limit = Number(queryDto.limit) || 10;
        const [categories, total] = await Promise.all([
            this.categoryRepository.findAll(queryDto),
            this.categoryRepository.count(queryDto)
        ]);

        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: categories,
            meta: { total, totalPages, page, limit }
        };
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        return await this.categoryRepository.findOne(id);
    }

    async findBySlug(slug: string): Promise<CategoryResponseDto> {
        return await this.categoryRepository.findByslug(slug)
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        return await this.categoryRepository.update(id, updateCategoryDto)
    }

    async delete(id: string): Promise<{ message: string }> {
        return await this.categoryRepository.delete(id)
    }
}
