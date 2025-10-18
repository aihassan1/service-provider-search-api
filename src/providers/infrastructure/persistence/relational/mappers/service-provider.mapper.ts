import { ServiceProvider } from '../../../../entities/service-provider.entity';
import { ServiceProviderEntity } from '../entities/service-provider.entity';

export class ServiceProviderMapper {
  static toDomain(raw: ServiceProviderEntity): ServiceProvider {
    const domainEntity = new ServiceProvider();
    domainEntity.id = raw.id;
    domainEntity.providerName = raw.providerName;
    domainEntity.providerType = raw.providerType;
    domainEntity.servicesProvided = raw.servicesProvided;
    domainEntity.specialization = raw.specialization;
    domainEntity.address = raw.address;
    domainEntity.city = raw.city;
    domainEntity.province = raw.province;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ServiceProvider): ServiceProviderEntity {
    const persistenceEntity = new ServiceProviderEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.providerName = domainEntity.providerName;
    persistenceEntity.providerType = domainEntity.providerType;
    persistenceEntity.servicesProvided = domainEntity.servicesProvided;
    persistenceEntity.specialization = domainEntity.specialization;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.city = domainEntity.city;
    persistenceEntity.province = domainEntity.province;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;

    return persistenceEntity;
  }
}
