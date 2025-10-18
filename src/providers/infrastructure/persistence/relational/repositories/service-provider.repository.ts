import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProviderEntity } from '../entities/service-provider.entity';
import {
  SearchResult,
  ServiceProviderRepository,
} from '../../service-provider.repository';
import { ServiceProvider } from '../../../../entities/service-provider.entity';
import { ServiceProviderMapper } from '../mappers/service-provider.mapper';
import { SearchServiceProviderDto } from '../../../../dto/search-service-provider.dto';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class ServiceProviderRelationalRepository
  implements ServiceProviderRepository
{
  constructor(
    @InjectRepository(ServiceProviderEntity)
    private readonly serviceProviderRepository: Repository<ServiceProviderEntity>,
  ) {}

  async create(
    data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceProvider> {
    const persistenceModel = ServiceProviderMapper.toPersistence(
      data as ServiceProvider,
    );
    const newEntity =
      await this.serviceProviderRepository.save(persistenceModel);
    return ServiceProviderMapper.toDomain(newEntity);
  }

  async createMany(
    data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<ServiceProvider[]> {
    const persistenceModels = data.map((item) =>
      ServiceProviderMapper.toPersistence(item as ServiceProvider),
    );
    const newEntities =
      await this.serviceProviderRepository.save(persistenceModels);
    return newEntities.map((entity) => ServiceProviderMapper.toDomain(entity));
  }

  async findById(id: ServiceProvider['id']): Promise<ServiceProvider | null> {
    const entity = await this.serviceProviderRepository.findOne({
      where: { id },
    });

    return entity ? ServiceProviderMapper.toDomain(entity) : null;
  }

  async search(
    dto: SearchServiceProviderDto,
  ): Promise<SearchResult<ServiceProvider>> {
    const { q, province, city, specialization, providerType, page, limit } =
      dto;

    const queryBuilder =
      this.serviceProviderRepository.createQueryBuilder('provider');

    // Apply filters
    if (province) {
      queryBuilder.andWhere('provider.province = :province', { province });
    }

    if (city) {
      queryBuilder.andWhere('provider.city = :city', { city });
    }

    if (specialization) {
      queryBuilder.andWhere('provider.specialization = :specialization', {
        specialization,
      });
    }

    if (providerType) {
      queryBuilder.andWhere('provider.providerType = :providerType', {
        providerType,
      });
    }

    // Apply fuzzy search using pg_trgm similarity
    if (q && q.trim()) {
      const searchTerm = q.trim();
      queryBuilder.andWhere(
        `(
          similarity(provider.providerName, :searchTerm) > 0.1 OR
          similarity(provider.specialization, :searchTerm) > 0.1 OR
          similarity(provider.servicesProvided, :searchTerm) > 0.1 OR
          similarity(provider.address, :searchTerm) > 0.1 OR
          similarity(provider.city, :searchTerm) > 0.1 OR
          provider.providerName ILIKE :searchPattern OR
          provider.specialization ILIKE :searchPattern OR
          provider.servicesProvided ILIKE :searchPattern OR
          provider.address ILIKE :searchPattern OR
          provider.city ILIKE :searchPattern
        )`,
        {
          searchTerm,
          searchPattern: `%${searchTerm}%`,
        },
      );

      // Order by relevance score
      queryBuilder.orderBy(
        `(
          similarity(provider.providerName, :searchTerm) * 2 +
          similarity(provider.specialization, :searchTerm) * 1.5 +
          similarity(provider.servicesProvided, :searchTerm) +
          similarity(provider.address, :searchTerm) * 0.5 +
          similarity(provider.city, :searchTerm)
        )`,
        'DESC',
      );
    } else {
      // Default ordering when no search query
      queryBuilder.orderBy('provider.createdAt', 'DESC');
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = ((page ?? 1) - 1) * (limit ?? 20);
    queryBuilder.skip(skip).take(limit ?? 20);

    // Execute query
    const entities = await queryBuilder.getMany();

    return {
      data: entities.map((entity) => ServiceProviderMapper.toDomain(entity)),
      total,
      page: page ?? 1,
      limit: limit ?? 20,
      totalPages: Math.ceil(total / (limit ?? 20)),
    };
  }

  async update(
    id: ServiceProvider['id'],
    payload: DeepPartial<ServiceProvider>,
  ): Promise<ServiceProvider | null> {
    const entity = await this.serviceProviderRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.serviceProviderRepository.save(
      this.serviceProviderRepository.merge(entity, payload),
    );

    return ServiceProviderMapper.toDomain(updatedEntity);
  }

  async remove(id: ServiceProvider['id']): Promise<void> {
    await this.serviceProviderRepository.delete(id);
  }

  async removeAll(): Promise<void> {
    await this.serviceProviderRepository.clear();
  }

  async getStatistics(): Promise<{
    total: number;
    byProvince: { province: string; count: number }[];
    bySpecialization: { specialization: string; count: number }[];
  }> {
    const total = await this.serviceProviderRepository.count();

    const byProvince = await this.serviceProviderRepository
      .createQueryBuilder('provider')
      .select('provider.province', 'province')
      .addSelect('COUNT(*)', 'count')
      .groupBy('provider.province')
      .orderBy('count', 'DESC')
      .getRawMany();

    const bySpecialization = await this.serviceProviderRepository
      .createQueryBuilder('provider')
      .select('provider.specialization', 'specialization')
      .addSelect('COUNT(*)', 'count')
      .groupBy('provider.specialization')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      total,
      byProvince: byProvince.map((item) => ({
        province: item.province,
        count: parseInt(item.count, 10),
      })),
      bySpecialization: bySpecialization.map((item) => ({
        specialization: item.specialization,
        count: parseInt(item.count, 10),
      })),
    };
  }

  async getFilterOptions(): Promise<{
    provinces: string[];
    cities: string[];
    specializations: string[];
    providerTypes: string[];
  }> {
    const provinces = await this.serviceProviderRepository
      .createQueryBuilder('provider')
      .select('DISTINCT provider.province', 'province')
      .orderBy('provider.province', 'ASC')
      .getRawMany()
      .then((results) => results.map((r) => r.province));

    const cities = await this.serviceProviderRepository
      .createQueryBuilder('provider')
      .select('DISTINCT provider.city', 'city')
      .orderBy('provider.city', 'ASC')
      .getRawMany()
      .then((results) => results.map((r) => r.city));

    const specializations = await this.serviceProviderRepository
      .createQueryBuilder('provider')
      .select('DISTINCT provider.specialization', 'specialization')
      .orderBy('provider.specialization', 'ASC')
      .getRawMany()
      .then((results) => results.map((r) => r.specialization));

    const providerTypes = await this.serviceProviderRepository
      .createQueryBuilder('provider')
      .select('DISTINCT provider.providerType', 'providerType')
      .orderBy('provider.providerType', 'ASC')
      .getRawMany()
      .then((results) => results.map((r) => r.providerType));

    return {
      provinces,
      cities,
      specializations,
      providerTypes,
    };
  }
}
