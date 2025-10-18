import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceProviderRepository } from './infrastructure/persistence/service-provider.repository';
import { ServiceProvider } from './entities/service-provider.entity';
import { SearchServiceProviderDto } from './dto/search-service-provider.dto';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { ExcelParserService } from '../excel-parser/excel-parser.service';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly excelParserService: ExcelParserService,
  ) {}

  async create(createDto: CreateServiceProviderDto): Promise<ServiceProvider> {
    return this.serviceProviderRepository.create({
      ...createDto,
      phoneNumber: createDto.phoneNumber ?? null,
    });
  }

  async findById(id: string): Promise<ServiceProvider> {
    const provider = await this.serviceProviderRepository.findById(id);
    if (!provider) {
      throw new NotFoundException(`Service provider with ID ${id} not found`);
    }
    return provider;
  }

  async search(dto: SearchServiceProviderDto) {
    return this.serviceProviderRepository.search(dto);
  }

  async getFilterOptions() {
    return this.serviceProviderRepository.getFilterOptions();
  }

  async getStatistics() {
    return this.serviceProviderRepository.getStatistics();
  }

  async importFromExcel(buffer: Buffer): Promise<{
    imported: number;
    failed: number;
    total: number;
  }> {
    // Validate file structure
    await this.excelParserService.validateExcelStructure(buffer);

    // Parse the Excel file
    const parsedProviders =
      await this.excelParserService.parseExcelFile(buffer);

    // Import providers in batch
    const imported =
      await this.serviceProviderRepository.createMany(parsedProviders);

    return {
      imported: imported.length,
      failed: parsedProviders.length - imported.length,
      total: parsedProviders.length,
    };
  }

  async clearAll(): Promise<void> {
    await this.serviceProviderRepository.removeAll();
  }

  async remove(id: string): Promise<void> {
    const provider = await this.serviceProviderRepository.findById(id);
    if (!provider) {
      throw new NotFoundException(`Service provider with ID ${id} not found`);
    }
    await this.serviceProviderRepository.remove(id);
  }
}
