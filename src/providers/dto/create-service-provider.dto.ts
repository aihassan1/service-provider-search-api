import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateServiceProviderDto {
  @ApiProperty({
    example: 'د محمد خالد صالح',
    description: 'Name of the service provider',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  providerName: string;

  @ApiProperty({
    example: 'هيئة أطباء',
    description: 'Type of service provider',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  providerType: string;

  @ApiProperty({
    example: 'خدمات خارجية',
    description: 'Services provided',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  servicesProvided: string;

  @ApiProperty({
    example: 'جراحة عظام وعمود فقري',
    description: 'Specialization',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  specialization: string;

  @ApiProperty({
    example: 'الشارع الكبير أعلى معمل مكة امام بنك مصر - فايد',
    description: 'Address',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: 'فايد',
    description: 'City or area',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  city: string;

  @ApiProperty({
    example: 'الإسماعيلية',
    description: 'Province or governorate',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  province: string;

  @ApiProperty({
    example: '1022970221',
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phoneNumber?: string;
}
