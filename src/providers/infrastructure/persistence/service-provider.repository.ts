import { ServiceProvider } from '../../entities/service-provider.entity';
import { SearchServiceProviderDto } from '../../dto/search-service-provider.dto';
import { DeepPartial } from '../../../utils/types/deep-partial.type';

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class ServiceProviderRepository {
  abstract create(
    data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceProvider>;

  abstract createMany(
    data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<ServiceProvider[]>;

  abstract findById(id: ServiceProvider['id']): Promise<ServiceProvider | null>;

  abstract search(
    dto: SearchServiceProviderDto,
  ): Promise<SearchResult<ServiceProvider>>;

  abstract update(
    id: ServiceProvider['id'],
    payload: DeepPartial<ServiceProvider>,
  ): Promise<ServiceProvider | null>;

  abstract remove(id: ServiceProvider['id']): Promise<void>;

  abstract removeAll(): Promise<void>;

  abstract getStatistics(): Promise<{
    total: number;
    byProvince: { province: string; count: number }[];
    bySpecialization: { specialization: string; count: number }[];
  }>;

  abstract getFilterOptions(): Promise<{
    provinces: string[];
    cities: string[];
    specializations: string[];
    providerTypes: string[];
  }>;
}
