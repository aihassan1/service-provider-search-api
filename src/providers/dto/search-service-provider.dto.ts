import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchServiceProviderDto {
  @ApiPropertyOptional({
    description: 'Search query for fuzzy search across multiple fields',
    example: 'جراحة عظام',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by province',
    example: 'القاهرة',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  province?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'مصر الجديدة',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by specialization',
    example: 'علاج طبيعي',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Filter by provider type',
    example: 'هيئة أطباء',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  providerType?: string;

  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
