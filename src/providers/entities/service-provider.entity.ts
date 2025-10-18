import { ApiProperty } from '@nestjs/swagger';

export class ServiceProvider {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'د محمد خالد صالح',
  })
  providerName: string;

  @ApiProperty({
    type: String,
    example: 'هيئة أطباء',
  })
  providerType: string;

  @ApiProperty({
    type: String,
    example: 'خدمات خارجية',
  })
  servicesProvided: string;

  @ApiProperty({
    type: String,
    example: 'جراحة عظام وعمود فقري',
  })
  specialization: string;

  @ApiProperty({
    type: String,
    example: 'الشارع الكبير أعلى معمل مكة امام بنك مصر - فايد',
  })
  address: string;

  @ApiProperty({
    type: String,
    example: 'فايد',
  })
  city: string;

  @ApiProperty({
    type: String,
    example: 'الإسماعيلية',
  })
  province: string;

  @ApiProperty({
    type: String,
    example: '1022970221',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
