import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { ServiceProvider } from './entities/service-provider.entity';
import { SearchServiceProviderDto } from './dto/search-service-provider.dto';

@ApiTags('Providers')
@Controller({
  path: 'providers',
  version: '1',
})
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search service providers with fuzzy search and filters',
    description:
      'Search for service providers using fuzzy search across multiple fields (name, specialization, services, address, city). Supports filtering by province, city, specialization, and provider type.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results with pagination',
    type: ServiceProvider,
    isArray: true,
  })
  async search(@Query() dto: SearchServiceProviderDto) {
    return this.providersService.search(dto);
  }

  @Get('filters')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available filter options',
    description:
      'Returns all available options for filtering: provinces, cities, specializations, and provider types',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filter options',
  })
  async getFilterOptions() {
    return this.providersService.getFilterOptions();
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get statistics about service providers',
    description:
      'Returns statistics including total count, distribution by province, and top specializations',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics data',
  })
  async getStatistics() {
    return this.providersService.getStatistics();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get service provider by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Service provider UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service provider details',
    type: ServiceProvider,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service provider not found',
  })
  async findById(@Param('id') id: string) {
    return this.providersService.findById(id);
  }
}
