# Developer Guide & AI Agent Reference

> **Comprehensive technical documentation for developers and AI agents working on the Service Provider Search API**

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Fuzzy Search Implementation](#fuzzy-search-implementation)
- [Excel Import System](#excel-import-system)
- [Code Patterns & Conventions](#code-patterns--conventions)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Extension Points](#extension-points)

---

## Project Overview

### Purpose

This API provides a searchable database of healthcare service providers in Egypt, supporting fuzzy search in Arabic, advanced filtering, and bulk Excel imports.

### Key Statistics

- **Total Providers**: 4,345
- **Provinces**: 29
- **Cities**: 326
- **Specializations**: 99
- **Provider Types**: 12

### Core Capabilities

1. **Fuzzy Search**: PostgreSQL pg_trgm-based search with weighted relevance
2. **Multi-field Filtering**: Province, city, specialization, provider type
3. **Excel Import**: Bulk import with validation and error handling
4. **RESTful API**: Clean, documented endpoints with Swagger
5. **Arabic Support**: Full UTF-8 support for Arabic text

---

## Architecture

### Clean Architecture Principles

The project follows **Clean Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, DTOs, Swagger Docs)      │
├─────────────────────────────────────────┤
│         Application Layer               │
│     (Services, Business Logic)          │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│    (Entities, Domain Models)            │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│  (TypeORM, Repositories, Database)      │
└─────────────────────────────────────────┘
```

### Module Structure

```
providers/
├── entities/                    # Domain entities (business logic)
│   └── service-provider.entity.ts
├── dto/                         # Data Transfer Objects
│   ├── create-service-provider.dto.ts
│   └── search-service-provider.dto.ts
├── infrastructure/
│   └── persistence/
│       ├── service-provider.repository.ts      # Abstract interface
│       └── relational/
│           ├── entities/                       # TypeORM entities
│           ├── repositories/                   # Concrete implementations
│           └── mappers/                        # Domain ↔ TypeORM mappers
├── providers.controller.ts      # Public endpoints
├── admin-providers.controller.ts # Admin endpoints
├── providers.service.ts         # Business logic
└── providers.module.ts          # Module definition
```

### Design Patterns

1. **Repository Pattern**: Database abstraction
   - Abstract interface: `ServiceProviderRepository`
   - Concrete implementation: `ServiceProviderRelationalRepository`
   - Easy to swap database implementations

2. **Mapper Pattern**: Entity conversion
   - Domain entities ↔ TypeORM entities
   - Keeps domain logic separate from infrastructure

3. **DTO Pattern**: Input validation
   - `CreateServiceProviderDto`: Creation validation
   - `SearchServiceProviderDto`: Search parameter validation
   - Uses `class-validator` decorators

4. **Dependency Injection**: Loose coupling
   - NestJS built-in DI container
   - Constructor injection throughout

---

## Technology Stack

### Core Technologies

| Technology          | Version | Purpose                           |
| ------------------- | ------- | --------------------------------- |
| **NestJS**          | 10.x    | Backend framework                 |
| **TypeScript**      | 5.x     | Type-safe language                |
| **PostgreSQL**      | 14+     | Primary database                  |
| **TypeORM**         | 0.3.x   | ORM for database access           |
| **pg_trgm**         | -       | PostgreSQL fuzzy search extension |
| **xlsx**            | 0.18.x  | Excel file parsing                |
| **class-validator** | 0.14.x  | DTO validation                    |
| **Swagger**         | 7.x     | API documentation                 |

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Husky**: Git hooks
- **Renovate**: Dependency updates

---

## Project Structure

### Complete Directory Tree

```
service-provider-app/
├── src/
│   ├── providers/                           # Main provider module
│   │   ├── entities/
│   │   │   └── service-provider.entity.ts   # Domain entity
│   │   ├── dto/
│   │   │   ├── create-service-provider.dto.ts
│   │   │   └── search-service-provider.dto.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── service-provider.repository.ts
│   │   │       └── relational/
│   │   │           ├── entities/
│   │   │           │   └── service-provider.entity.ts  # TypeORM entity
│   │   │           ├── repositories/
│   │   │           │   └── service-provider.repository.ts
│   │   │           └── mappers/
│   │   │               └── service-provider.mapper.ts
│   │   ├── providers.controller.ts          # Public API
│   │   ├── admin-providers.controller.ts    # Admin API
│   │   ├── providers.service.ts             # Business logic
│   │   └── providers.module.ts              # Module config
│   ├── excel-parser/                        # Excel parsing module
│   │   ├── excel-parser.service.ts
│   │   └── excel-parser.module.ts
│   ├── database/
│   │   ├── migrations/                      # Database migrations
│   │   │   └── 1760759761951-CreateServiceProvider.ts
│   │   └── typeorm-config.service.ts        # TypeORM configuration
│   ├── app.module.ts                        # Root module
│   └── main.ts                              # Application entry point
├── test/                                    # E2E tests
├── docs/                                    # Boilerplate documentation
├── .env                                     # Environment variables
├── package.json                             # Dependencies
├── tsconfig.json                            # TypeScript config
├── README.md                                # User documentation
├── API_DOCUMENTATION.md                     # API reference
└── DEVELOPER_GUIDE.md                       # This file
```

### Key Files Explained

#### Domain Entity (`src/providers/entities/service-provider.entity.ts`)

```typescript
export class ServiceProvider {
  id: string;
  providerName: string;
  providerType: string;
  servicesProvided: string;
  specialization: string;
  address: string;
  city: string;
  province: string;
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

- Pure domain model
- No database annotations
- Business logic only

#### TypeORM Entity (`src/providers/infrastructure/persistence/relational/entities/service-provider.entity.ts`)

```typescript
@Entity('service_provider')
export class ServiceProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  @Index('idx_provider_name')
  providerName: string;

  // ... other columns with database annotations
}
```

- Database-specific annotations
- Indexes defined here
- Infrastructure concern

#### Mapper (`src/providers/infrastructure/persistence/relational/mappers/service-provider.mapper.ts`)

```typescript
export class ServiceProviderMapper {
  static toDomain(raw: ServiceProviderEntity): ServiceProvider {
    const entity = new ServiceProvider();
    entity.id = raw.id;
    entity.providerName = raw.providerName;
    // ... map all fields
    return entity;
  }

  static toPersistence(entity: ServiceProvider): ServiceProviderEntity {
    const persistenceEntity = new ServiceProviderEntity();
    persistenceEntity.id = entity.id;
    persistenceEntity.providerName = entity.providerName;
    // ... map all fields
    return persistenceEntity;
  }
}
```

- Converts between domain and TypeORM entities
- Keeps layers decoupled

---

## Database Design

### Schema

#### service_provider Table

```sql
CREATE TABLE service_provider (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(500) NOT NULL,
  provider_type VARCHAR(200) NOT NULL,
  services_provided VARCHAR(500) NOT NULL,
  specialization VARCHAR(300) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(200) NOT NULL,
  province VARCHAR(200) NOT NULL,
  phone_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes

```sql
-- Fuzzy search performance
CREATE INDEX idx_provider_name ON service_provider(provider_name);
CREATE INDEX idx_services_provided ON service_provider(services_provided);
CREATE INDEX idx_specialization ON service_provider(specialization);
CREATE INDEX idx_address ON service_provider(address);

-- Filter performance
CREATE INDEX idx_city ON service_provider(city);
CREATE INDEX idx_province ON service_provider(province);
```

### Extensions

```sql
-- Enable fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Migration System

Migrations are managed by TypeORM:

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

**Migration File Structure:**

```typescript
export class CreateServiceProvider1760759761951 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table, indexes, etc.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback changes
  }
}
```

---

## API Endpoints

### Public Endpoints

#### 1. Search Providers

```
GET /api/v1/providers/search
```

**Controller:** `ProvidersController.search()`  
**Service:** `ProvidersService.findAll()`  
**Repository:** `ServiceProviderRelationalRepository.findAll()`

**Query Parameters:**

- `q` (string): Search query for fuzzy matching
- `province` (string): Filter by province
- `city` (string): Filter by city
- `specialization` (string): Filter by specialization
- `providerType` (string): Filter by provider type
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response:**

```typescript
{
  data: ServiceProvider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Implementation Details:**

- Uses `SearchServiceProviderDto` for validation
- Fuzzy search with pg_trgm similarity
- Weighted relevance scoring
- Pagination with TypeORM `skip` and `take`

#### 2. Get Filter Options

```
GET /api/v1/providers/filters
```

**Controller:** `ProvidersController.getFilters()`  
**Service:** `ProvidersService.getFilterOptions()`  
**Repository:** `ServiceProviderRelationalRepository.getDistinctValues()`

**Response:**

```typescript
{
  provinces: string[];
  cities: string[];
  specializations: string[];
  providerTypes: string[];
}
```

**Implementation:**

```sql
SELECT DISTINCT province FROM service_provider ORDER BY province;
SELECT DISTINCT city FROM service_provider ORDER BY city;
-- ... etc
```

#### 3. Get Statistics

```
GET /api/v1/providers/statistics
```

**Controller:** `ProvidersController.getStatistics()`  
**Service:** `ProvidersService.getStatistics()`  
**Repository:** `ServiceProviderRelationalRepository.getStatistics()`

**Response:**

```typescript
{
  total: number;
  byProvince: Array<{ province: string; count: number }>;
  bySpecialization: Array<{ specialization: string; count: number }>;
}
```

**Implementation:**

```sql
SELECT COUNT(*) FROM service_provider;
SELECT province, COUNT(*) as count FROM service_provider GROUP BY province ORDER BY count DESC;
SELECT specialization, COUNT(*) as count FROM service_provider GROUP BY specialization ORDER BY count DESC LIMIT 20;
```

#### 4. Get Provider by ID

```
GET /api/v1/providers/:id
```

**Controller:** `ProvidersController.findOne()`  
**Service:** `ProvidersService.findOne()`  
**Repository:** `ServiceProviderRelationalRepository.findById()`

**Response:** Single `ServiceProvider` object or 404

### Admin Endpoints

#### 5. Upload Excel File

```
POST /api/v1/admin/providers/upload
```

**Controller:** `AdminProvidersController.uploadFile()`  
**Services:**

- `ExcelParserService.parseExcel()`
- `ProvidersService.bulkCreate()`

**Request:**

- Content-Type: `multipart/form-data`
- Body: `file` (Excel file)

**Validation:**

- File type: `.xlsx` or `.xls`
- Max size: 10MB
- Required columns present

**Response:**

```typescript
{
  message: string;
  imported: number;
  failed: number;
  total: number;
}
```

#### 6. Clear All Providers

```
DELETE /api/v1/admin/providers/clear
```

**Controller:** `AdminProvidersController.clearAll()`  
**Service:** `ProvidersService.clearAll()`  
**Repository:** `ServiceProviderRelationalRepository.deleteAll()`

**Implementation:**

```sql
DELETE FROM service_provider;
```

#### 7. Delete Provider

```
DELETE /api/v1/admin/providers/:id
```

**Controller:** `AdminProvidersController.remove()`  
**Service:** `ProvidersService.remove()`  
**Repository:** `ServiceProviderRelationalRepository.delete()`

---

## Fuzzy Search Implementation

### Overview

The fuzzy search uses **PostgreSQL's pg_trgm extension** which provides:

- **Trigram similarity**: Breaks text into 3-character sequences
- **Similarity operator**: `similarity(text1, text2)` returns 0-1 score
- **GIN indexes**: Fast trigram lookups

### Algorithm

```typescript
// Pseudo-code for fuzzy search
const query = "جراحة";
const minSimilarity = 0.1;

SELECT * FROM service_provider
WHERE (
  similarity(provider_name, query) > minSimilarity OR
  similarity(specialization, query) > minSimilarity OR
  similarity(services_provided, query) > minSimilarity OR
  similarity(address, query) > minSimilarity OR
  similarity(city, query) > minSimilarity OR
  provider_name ILIKE '%' || query || '%' OR
  specialization ILIKE '%' || query || '%'
)
ORDER BY (
  similarity(provider_name, query) * 2.0 +
  similarity(specialization, query) * 1.5 +
  similarity(services_provided, query) * 1.0 +
  similarity(city, query) * 1.0 +
  similarity(address, query) * 0.5
) DESC
```

### Implementation in Repository

```typescript
async findAll(dto: SearchServiceProviderDto): Promise<[ServiceProvider[], number]> {
  const queryBuilder = this.repository.createQueryBuilder('provider');

  // Fuzzy search
  if (dto.q) {
    const searchQuery = dto.q.trim();
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where(`similarity(provider.providerName, :query) > 0.1`, { query: searchQuery })
          .orWhere(`similarity(provider.specialization, :query) > 0.1`, { query: searchQuery })
          .orWhere(`similarity(provider.servicesProvided, :query) > 0.1`, { query: searchQuery })
          .orWhere(`similarity(provider.address, :query) > 0.1`, { query: searchQuery })
          .orWhere(`similarity(provider.city, :query) > 0.1`, { query: searchQuery })
          .orWhere(`provider.providerName ILIKE :pattern`, { pattern: `%${searchQuery}%` })
          .orWhere(`provider.specialization ILIKE :pattern`, { pattern: `%${searchQuery}%` });
      })
    );

    // Relevance scoring
    queryBuilder.addSelect(
      `(
        similarity(provider.providerName, :query) * 2 +
        similarity(provider.specialization, :query) * 1.5 +
        similarity(provider.servicesProvided, :query) * 1 +
        similarity(provider.city, :query) * 1 +
        similarity(provider.address, :query) * 0.5
      )`,
      'relevance'
    );
    queryBuilder.orderBy('relevance', 'DESC');
  }

  // Filters
  if (dto.province) {
    queryBuilder.andWhere('provider.province = :province', { province: dto.province });
  }
  // ... other filters

  // Pagination
  const page = dto.page || 1;
  const limit = Math.min(dto.limit || 20, 100);
  queryBuilder.skip((page - 1) * limit).take(limit);

  const [results, total] = await queryBuilder.getManyAndCount();
  return [results.map(ServiceProviderMapper.toDomain), total];
}
```

### Tuning Parameters

| Parameter               | Value | Purpose                           |
| ----------------------- | ----- | --------------------------------- |
| `similarity_threshold`  | 0.1   | Minimum similarity to match (10%) |
| `provider_name_weight`  | 2.0   | Highest priority field            |
| `specialization_weight` | 1.5   | High priority field               |
| `services_weight`       | 1.0   | Medium priority field             |
| `city_weight`           | 1.0   | Medium priority field             |
| `address_weight`        | 0.5   | Lower priority field              |

**Adjusting weights:**

- Increase weight = higher priority in relevance scoring
- Decrease similarity threshold = more matches (less strict)
- Increase similarity threshold = fewer matches (more strict)

---

## Excel Import System

### Flow

```
1. File Upload (multipart/form-data)
   ↓
2. File Validation (type, size)
   ↓
3. Excel Parsing (xlsx library)
   ↓
4. Data Validation (required fields, formats)
   ↓
5. Data Cleaning (trim, normalize)
   ↓
6. Bulk Insert (TypeORM)
   ↓
7. Response (success/failure counts)
```

### ExcelParserService

```typescript
@Injectable()
export class ExcelParserService {
  parseExcel(buffer: Buffer): CreateServiceProviderDto[] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    return data.map((row: any) => ({
      providerName: this.cleanString(row['مقدم الخدمة']),
      providerType: this.cleanString(row['نوع مقدم الخدمة']),
      servicesProvided: this.cleanString(row['الخدمات المقدمة']),
      specialization: this.cleanString(row['التخصص']),
      address: this.cleanString(row['العنوان']),
      city: this.cleanString(row['المنطقة / المدينة']),
      province: this.cleanString(row['المحافظة']),
      phoneNumber: this.cleanPhoneNumber(row['Tel. no. - التليفون']),
    }));
  }

  private cleanString(value: any): string {
    if (!value) return '';
    return String(value).trim();
  }

  private cleanPhoneNumber(value: any): string | null {
    if (!value) return null;
    const cleaned = String(value).trim();
    return cleaned || null;
  }
}
```

### Bulk Insert Strategy

```typescript
async bulkCreate(dtos: CreateServiceProviderDto[]): Promise<number> {
  const entities = dtos.map((dto) => {
    const entity = new ServiceProviderEntity();
    Object.assign(entity, dto);
    return entity;
  });

  // Batch insert for performance
  const batchSize = 1000;
  let imported = 0;

  for (let i = 0; i < entities.length; i += batchSize) {
    const batch = entities.slice(i, i + batchSize);
    await this.repository.save(batch);
    imported += batch.length;
  }

  return imported;
}
```

### Error Handling

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  try {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Only Excel files are allowed');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    // Parse and import
    const providers = this.excelParserService.parseExcel(file.buffer);
    const imported = await this.providersService.bulkCreate(providers);

    return {
      message: 'File processed successfully',
      imported,
      failed: 0,
      total: providers.length,
    };
  } catch (error) {
    throw new BadRequestException(`Failed to process file: ${error.message}`);
  }
}
```

---

## Code Patterns & Conventions

### Naming Conventions

| Type       | Convention              | Example                      |
| ---------- | ----------------------- | ---------------------------- |
| Classes    | PascalCase              | `ServiceProvider`            |
| Interfaces | PascalCase + `I` prefix | `IServiceProviderRepository` |
| Methods    | camelCase               | `findAll()`                  |
| Variables  | camelCase               | `providerName`               |
| Constants  | UPPER_SNAKE_CASE        | `MAX_FILE_SIZE`              |
| Files      | kebab-case              | `service-provider.entity.ts` |

### DTO Validation

```typescript
export class SearchServiceProviderDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'جراحة' })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'القاهرة' })
  province?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @ApiPropertyOptional({ example: 20 })
  limit?: number;
}
```

### Error Handling

```typescript
// Service layer
async findOne(id: string): Promise<ServiceProvider> {
  const provider = await this.repository.findById(id);
  if (!provider) {
    throw new NotFoundException(`Service provider with ID ${id} not found`);
  }
  return provider;
}

// Global exception filter (built-in)
// Returns:
{
  "statusCode": 404,
  "message": "Service provider with ID xxx not found",
  "error": "Not Found"
}
```

### Swagger Documentation

```typescript
@ApiTags('Providers')
@Controller({ path: 'providers', version: '1' })
export class ProvidersController {
  @Get('search')
  @ApiOperation({ summary: 'Search service providers with fuzzy matching' })
  @ApiResponse({
    status: 200,
    description: 'Providers found',
    type: [ServiceProvider],
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async search(@Query() dto: SearchServiceProviderDto) {
    // ...
  }
}
```

---

## Development Workflow

### Setup Development Environment

```bash
# 1. Clone repository
git clone <repo-url>
cd service-provider-app

# 2. Install dependencies
npm install

# 3. Setup database
sudo service postgresql start
sudo -u postgres psql -c "CREATE DATABASE api;"
sudo -u postgres psql -d api -c "CREATE EXTENSION pg_trgm;"

# 4. Configure environment
cp env-example-relational .env
# Edit .env with your settings

# 5. Run migrations
npm run migration:run

# 6. Start development server
npm run start:dev
```

### Development Commands

```bash
# Start dev server (watch mode)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Database migrations
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Seed database
npm run seed:run:relational
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## Testing Strategy

### Unit Tests

```typescript
// providers.service.spec.ts
describe('ProvidersService', () => {
  let service: ProvidersService;
  let repository: ServiceProviderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: 'ServiceProviderRepository',
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    repository = module.get<ServiceProviderRepository>(
      'ServiceProviderRepository',
    );
  });

  it('should find all providers', async () => {
    const mockProviders = [
      /* ... */
    ];
    jest.spyOn(repository, 'findAll').mockResolvedValue([mockProviders, 1]);

    const result = await service.findAll({});
    expect(result.data).toEqual(mockProviders);
    expect(result.total).toBe(1);
  });
});
```

### E2E Tests

```typescript
// providers.e2e-spec.ts
describe('Providers (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/providers/search (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/providers/search?q=جراحة')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

### Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **E2E Tests**: All critical paths
- **Integration Tests**: Database operations

---

## Deployment Guide

### Environment Variables

```env
# Production environment
NODE_ENV=production
APP_PORT=3000

# Database
DATABASE_HOST=your-db-host.com
DATABASE_PORT=5432
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-strong-password
DATABASE_NAME=api
DATABASE_SSL_ENABLED=true

# API
API_PREFIX=api
API_VERSION=1

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment

**Dockerfile:**

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: root
      DATABASE_PASSWORD: secret
      DATABASE_NAME: api
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: api
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

volumes:
  postgres_data:
```

**Deploy:**

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong database credentials
- [ ] Enable SSL for database connections
- [ ] Configure CORS for specific origins
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up database backups
- [ ] Configure logging (Winston, Sentry)
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Run security audit: `npm audit`
- [ ] Optimize database indexes
- [ ] Set up database connection pooling

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Check connection
psql -U root -d api -h localhost
```

#### 2. Migration Failed

**Error:**

```
QueryFailedError: relation "service_provider" already exists
```

**Solution:**

```bash
# Revert last migration
npm run migration:revert

# Or drop and recreate database
sudo -u postgres psql -c "DROP DATABASE api;"
sudo -u postgres psql -c "CREATE DATABASE api;"
sudo -u postgres psql -d api -c "CREATE EXTENSION pg_trgm;"
npm run migration:run
```

#### 3. Fuzzy Search Not Working

**Error:**

```
ERROR: function similarity(character varying, character varying) does not exist
```

**Solution:**

```bash
# Enable pg_trgm extension
sudo -u postgres psql -d api -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

#### 4. Excel Upload Failed

**Error:**

```
BadRequestException: Invalid file format
```

**Solution:**

- Ensure file is `.xlsx` or `.xls`
- Check file size (max 10MB)
- Verify column names match expected Arabic names
- Check file encoding (should be UTF-8)

#### 5. Slow Search Performance

**Solution:**

```sql
-- Check if indexes exist
SELECT indexname FROM pg_indexes WHERE tablename = 'service_provider';

-- Rebuild indexes
REINDEX TABLE service_provider;

-- Analyze table for query planner
ANALYZE service_provider;

-- Check query plan
EXPLAIN ANALYZE SELECT * FROM service_provider WHERE similarity(provider_name, 'test') > 0.1;
```

---

## Extension Points

### Adding New Fields

1. **Update Domain Entity**

```typescript
// src/providers/entities/service-provider.entity.ts
export class ServiceProvider {
  // ... existing fields
  email?: string; // New field
}
```

2. **Update TypeORM Entity**

```typescript
// src/providers/infrastructure/persistence/relational/entities/service-provider.entity.ts
@Entity('service_provider')
export class ServiceProviderEntity {
  // ... existing fields

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;
}
```

3. **Update Mapper**

```typescript
// src/providers/infrastructure/persistence/relational/mappers/service-provider.mapper.ts
static toDomain(raw: ServiceProviderEntity): ServiceProvider {
  // ... existing mappings
  entity.email = raw.email;
  return entity;
}
```

4. **Create Migration**

```bash
npm run migration:generate -- src/database/migrations/AddEmailField
npm run migration:run
```

5. **Update DTOs**

```typescript
// src/providers/dto/create-service-provider.dto.ts
export class CreateServiceProviderDto {
  // ... existing fields

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

### Adding New Endpoints

1. **Add Method to Controller**

```typescript
@Get('by-province/:province')
@ApiOperation({ summary: 'Get providers by province' })
async getByProvince(@Param('province') province: string) {
  return this.providersService.findByProvince(province);
}
```

2. **Add Method to Service**

```typescript
async findByProvince(province: string): Promise<ServiceProvider[]> {
  return this.repository.findByProvince(province);
}
```

3. **Add Method to Repository**

```typescript
async findByProvince(province: string): Promise<ServiceProvider[]> {
  const entities = await this.repository.find({ where: { province } });
  return entities.map(ServiceProviderMapper.toDomain);
}
```

### Adding New Filters

1. **Update Search DTO**

```typescript
export class SearchServiceProviderDto {
  // ... existing fields

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  servicesProvided?: string;
}
```

2. **Update Repository Query**

```typescript
if (dto.servicesProvided) {
  queryBuilder.andWhere('provider.servicesProvided = :servicesProvided', {
    servicesProvided: dto.servicesProvided,
  });
}
```

### Adding Authentication

1. **Install Passport**

```bash
npm install @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

2. **Create Auth Module**

```typescript
// src/auth/auth.module.ts
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

3. **Protect Endpoints**

```typescript
@UseGuards(AuthGuard('jwt'))
@Post('upload')
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // ... protected endpoint
}
```

### Adding Caching

1. **Install Redis**

```bash
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-store
```

2. **Configure Cache Module**

```typescript
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 300, // 5 minutes
    }),
  ],
})
export class AppModule {}
```

3. **Use Cache Interceptor**

```typescript
@UseInterceptors(CacheInterceptor)
@Get('filters')
async getFilters() {
  return this.providersService.getFilterOptions();
}
```

---

## AI Agent Instructions

### For Code Generation

When generating code for this project:

1. **Follow Clean Architecture**: Separate domain, application, and infrastructure layers
2. **Use Repository Pattern**: Abstract database operations behind interfaces
3. **Validate with DTOs**: Use `class-validator` decorators
4. **Document with Swagger**: Add `@Api*` decorators
5. **Handle Errors**: Use NestJS built-in exceptions
6. **Write Tests**: Include unit and E2E tests
7. **Follow Naming Conventions**: camelCase for methods, PascalCase for classes
8. **Use TypeScript**: Full type annotations

### For Debugging

When debugging issues:

1. **Check Logs**: Look in console output or log files
2. **Verify Database**: Check PostgreSQL connection and data
3. **Test Endpoints**: Use Swagger UI or curl
4. **Check Migrations**: Ensure all migrations are applied
5. **Verify Environment**: Check `.env` file settings
6. **Review Stack Traces**: Follow error messages carefully

### For Extending

When adding new features:

1. **Start with Domain**: Define domain entities first
2. **Add DTOs**: Create validation DTOs
3. **Implement Repository**: Add database operations
4. **Add Service Logic**: Implement business logic
5. **Create Controller**: Add HTTP endpoints
6. **Write Tests**: Test all new code
7. **Update Documentation**: Update README and API docs
8. **Create Migration**: If database changes are needed

---

## Additional Resources

### Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Swagger/OpenAPI](https://swagger.io/specification/)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database management
- [VS Code](https://code.visualstudio.com/) - IDE

### Community

- [NestJS Discord](https://discord.gg/nestjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs)

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
