import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
export class QueryCategoryDto {
    @ApiPropertyOptional({
        example: true,
        description: "filter by active status"
    })
    @Transform(({ value }) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return undefined;
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean

    @ApiPropertyOptional({
        example: "electronics",
        description: "Search term to filter categories by name or description",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: "1",
        description: "Number of items to return per page",
        default: 1,
        minimum: 1
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page = 1;

    @ApiPropertyOptional({
        example: "10",
        description: "Number of items to return per page of pagination",
        default: 10,
        minimum: 1
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit = 10;


}