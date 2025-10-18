# Service Provider Search Application

A full-stack application for managing and searching service provider data with fuzzy search capabilities, built with NestJS backend and designed for React frontend integration.

## 🎯 Features

### Backend (Completed ✅)

- **Excel File Import**: Upload and parse Excel files with service provider data
- **Fuzzy Search**: Advanced search using PostgreSQL pg_trgm extension
- **Multi-field Search**: Search across provider name, specialization, services, address, and city
- **Advanced Filtering**: Filter by province, city, specialization, and provider type
- **RESTful API**: Clean, well-documented API endpoints
- **Admin Panel**: Protected endpoints for data management
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Swagger UI available at `/docs`

### Data Statistics

- **Total Providers**: 4,345
- **Provinces**: 29
- **Cities**: 326
- **Specializations**: 99
- **Provider Types**: 12

## 🏗️ Architecture

### Technology Stack

**Backend:**

- NestJS (Node.js framework)
- TypeORM (ORM)
- PostgreSQL (Database)
- pg_trgm (Fuzzy search extension)
- JWT (Authentication)
- Swagger (API documentation)
- xlsx (Excel parsing)

**Planned Frontend:**

- React
- Axios/Fetch (API calls)
- React Router (Navigation)
- Material-UI or Tailwind CSS (UI components)

### Project Structure

```
src/
├── providers/                          # Service provider module
│   ├── entities/                       # Domain entities
│   ├── dto/                            # Data transfer objects
│   ├── infrastructure/
│   │   └── persistence/
│   │       ├── relational/
│   │       │   ├── entities/           # TypeORM entities
│   │       │   ├── repositories/       # Repository implementations
│   │       │   └── mappers/            # Entity mappers
│   │       └── service-provider.repository.ts
│   ├── providers.controller.ts         # Public endpoints
│   ├── admin-providers.controller.ts   # Admin endpoints
│   ├── providers.service.ts            # Business logic
│   └── providers.module.ts             # Module definition
├── excel-parser/                       # Excel parsing module
│   ├── excel-parser.service.ts
│   └── excel-parser.module.ts
├── database/
│   └── migrations/                     # Database migrations
└── app.module.ts                       # Root module
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x
- PostgreSQL 14+
- npm or pnpm

### Installation

1. **Clone the repository**

   ```bash
   cd service-provider-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment**

   ```bash
   cp env-example-relational .env
   ```

4. **Start PostgreSQL**

   ```bash
   sudo service postgresql start
   ```

5. **Run migrations**

   ```bash
   npm run migration:run
   ```

6. **Seed admin user**

   ```bash
   npm run seed:run:relational
   ```

   Default admin credentials:
   - Email: `admin@example.com`
   - Password: `secret`

7. **Start the application**

   ```bash
   npm run start:dev
   ```

8. **Access the API**
   - API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/docs

## 📚 API Usage

### Public Endpoints

#### Search Providers

```bash
# Basic search
curl "http://localhost:3000/api/v1/providers/search?q=جراحة&limit=10"

# With filters
curl "http://localhost:3000/api/v1/providers/search?province=القاهرة&specialization=علاج%20طبيعي"
```

#### Get Filter Options

```bash
curl "http://localhost:3000/api/v1/providers/filters"
```

#### Get Statistics

```bash
curl "http://localhost:3000/api/v1/providers/statistics"
```

### Admin Endpoints

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

#### Upload Excel File

```bash
TOKEN="your_jwt_token"

curl -X POST http://localhost:3000/api/v1/admin/providers/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@providers.xlsx"
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔍 Search Capabilities

### Fuzzy Search Algorithm

The application uses PostgreSQL's `pg_trgm` extension for fuzzy matching:

- **Trigram Similarity**: Calculates similarity between search terms and database values
- **ILIKE Pattern Matching**: Fallback for partial matches
- **Weighted Scoring**: Different fields have different importance weights
- **Arabic Support**: Full support for Arabic text search

### Search Fields & Weights

| Field             | Weight | Description      |
| ----------------- | ------ | ---------------- |
| Provider Name     | 2.0    | Highest priority |
| Specialization    | 1.5    | High priority    |
| Services Provided | 1.0    | Medium priority  |
| City              | 1.0    | Medium priority  |
| Address           | 0.5    | Lower priority   |

### Example Searches

**Search for "جراحة" (surgery):**

- Returns 472 results
- Includes: "جراحة عظام", "جراحة عامة", "جراحة مخ وأعصاب"

**Search for "طبيعي" (physical therapy):**

- Returns 1,460 results
- Matches: "علاج طبيعي", "مركز العلاج الطبيعي"

## 📊 Database Schema

### service_provider Table

```sql
CREATE TABLE service_provider (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  providerName VARCHAR(500) NOT NULL,
  providerType VARCHAR(200) NOT NULL,
  servicesProvided VARCHAR(500) NOT NULL,
  specialization VARCHAR(300) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(200) NOT NULL,
  province VARCHAR(200) NOT NULL,
  phoneNumber VARCHAR(100),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes for search performance
CREATE INDEX idx_provider_name ON service_provider(providerName);
CREATE INDEX idx_services_provided ON service_provider(servicesProvided);
CREATE INDEX idx_specialization ON service_provider(specialization);
CREATE INDEX idx_address ON service_provider(address);
CREATE INDEX idx_city ON service_provider(city);
CREATE INDEX idx_province ON service_provider(province);
```

## 🎨 Frontend Development Guide

### Recommended React Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx           # Search input with autocomplete
│   │   ├── FilterPanel.tsx         # Province, city, specialization filters
│   │   ├── ProviderCard.tsx        # Provider display card
│   │   ├── ProviderList.tsx        # List of providers with pagination
│   │   └── AdminUpload.tsx         # Excel file upload component
│   ├── pages/
│   │   ├── HomePage.tsx            # Main search page
│   │   ├── ProviderDetails.tsx     # Provider detail page
│   │   └── AdminPanel.tsx          # Admin dashboard
│   ├── services/
│   │   └── api.ts                  # API client
│   ├── hooks/
│   │   ├── useSearch.ts            # Search hook
│   │   └── useFilters.ts           # Filters hook
│   └── App.tsx
```

### API Integration Example

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const searchProviders = async (params: {
  q?: string;
  province?: string;
  city?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await axios.get(`${API_BASE_URL}/providers/search`, {
    params,
  });
  return response.data;
};

export const getFilterOptions = async () => {
  const response = await axios.get(`${API_BASE_URL}/providers/filters`);
  return response.data;
};
```

### Search Component Example

```typescript
// components/SearchBar.tsx
import { useState } from 'react';
import { searchProviders } from '../services/api';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchProviders({ q: query, limit: 20 });
    setResults(data.data);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن مقدم خدمة..."
      />
      <button onClick={handleSearch}>بحث</button>

      {results.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
};
```

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin-only endpoints protected
- **Input Validation**: All inputs validated using class-validator
- **SQL Injection Prevention**: TypeORM parameterized queries
- **File Upload Validation**: File type and size restrictions

## 🧪 Testing

### Test Results

✅ **Excel Import**: Successfully imported 4,345 providers  
✅ **Fuzzy Search**: All search queries returning accurate results  
✅ **Filters**: Province, city, and specialization filters working  
✅ **Pagination**: Proper pagination with configurable limits  
✅ **Statistics**: Accurate counts and distributions

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📈 Performance

- **Database Indexes**: All searchable fields indexed
- **Connection Pooling**: 100 concurrent connections
- **Batch Import**: Efficient bulk insert for Excel data
- **Query Optimization**: Fuzzy search optimized with pg_trgm
- **Response Time**: < 100ms for most queries

## 🛠️ Development

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Clean Code Principles

- **Separation of Concerns**: Modular architecture
- **Repository Pattern**: Database abstraction
- **DTO Validation**: Input validation at boundaries
- **Dependency Injection**: Loose coupling
- **Error Handling**: Global exception filters

## 📝 Excel File Format

The application expects Excel files with the following columns:

| Column (Arabic)     | Column (English)  | Required | Type |
| ------------------- | ----------------- | -------- | ---- |
| مقدم الخدمة         | Provider Name     | Yes      | Text |
| نوع مقدم الخدمة     | Provider Type     | Yes      | Text |
| الخدمات المقدمة     | Services Provided | Yes      | Text |
| التخصص              | Specialization    | Yes      | Text |
| العنوان             | Address           | Yes      | Text |
| المنطقة / المدينة   | City              | Yes      | Text |
| المحافظة            | Province          | Yes      | Text |
| Tel. no. - التليفون | Phone Number      | No       | Text |

## 🚧 Future Enhancements

### Backend

- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add more filter options
- [ ] Export search results to Excel
- [ ] Add audit logging

### Frontend (To be implemented)

- [ ] React application with search interface
- [ ] Advanced filter UI
- [ ] Provider detail modal
- [ ] Admin dashboard
- [ ] File upload with progress
- [ ] Responsive design
- [ ] Arabic RTL support

## 📄 License

This project uses the NestJS Boilerplate as a foundation. See the original [NestJS Boilerplate](https://github.com/brocoders/nestjs-boilerplate) for license information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For questions or issues:

- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [NestJS Documentation](https://docs.nestjs.com)
- Open an issue on GitHub

---

**Status**: Backend Complete ✅ | Frontend Pending 🚧

**Last Updated**: October 18, 2025
