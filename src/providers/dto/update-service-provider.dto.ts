import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateServiceProviderDto {
  @ApiPropertyOptional({
    example: 'د. أحمد محمد',
    description: 'Name of the service provider',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  providerName?: string;

  @ApiPropertyOptional({
    example: 'مستشفى',
    description: 'Type of provider',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  providerType?: string;

  @ApiPropertyOptional({
    example: 'خدمات خارجية',
    description: 'Services provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  servicesProvided?: string;

  @ApiPropertyOptional({
    example: 'جراحة عامة',
    description: 'Medical specialization',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  specialization?: string;

  @ApiPropertyOptional({
    example: '123 شارع الجامعة، الدور الثاني',
    description: 'Full address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'مدينة نصر',
    description: 'City name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  city?: string;

  @ApiPropertyOptional({
    example: 'القاهرة',
    description: 'Province/Governorate',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  province?: string;

  @ApiPropertyOptional({
    example: '01234567890',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phoneNumber?: string | null;
}
