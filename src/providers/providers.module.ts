import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './providers.controller';
import { AdminProvidersController } from './admin-providers.controller';
import { ProvidersService } from './providers.service';
import { ServiceProviderEntity } from './infrastructure/persistence/relational/entities/service-provider.entity';
import { ServiceProviderRelationalRepository } from './infrastructure/persistence/relational/repositories/service-provider.repository';
import { ServiceProviderRepository } from './infrastructure/persistence/service-provider.repository';
import { ExcelParserModule } from '../excel-parser/excel-parser.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceProviderEntity]),
    ExcelParserModule,
  ],
  controllers: [ProvidersController, AdminProvidersController],
  providers: [
    ProvidersService,
    {
      provide: ServiceProviderRepository,
      useClass: ServiceProviderRelationalRepository,
    },
  ],
  exports: [ProvidersService, ServiceProviderRepository],
})
export class ProvidersModule {}
