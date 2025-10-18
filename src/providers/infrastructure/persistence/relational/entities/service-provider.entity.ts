import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'service_provider',
})
export class ServiceProviderEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_provider_name')
  @Column({ type: 'varchar', length: 500 })
  providerName: string;

  @Column({ type: 'varchar', length: 200 })
  providerType: string;

  @Index('idx_services_provided')
  @Column({ type: 'varchar', length: 500 })
  servicesProvided: string;

  @Index('idx_specialization')
  @Column({ type: 'varchar', length: 300 })
  specialization: string;

  @Index('idx_address')
  @Column({ type: 'text' })
  address: string;

  @Index('idx_city')
  @Column({ type: 'varchar', length: 200 })
  city: string;

  @Index('idx_province')
  @Column({ type: 'varchar', length: 200 })
  province: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phoneNumber: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
