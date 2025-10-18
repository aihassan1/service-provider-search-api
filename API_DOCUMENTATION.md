# Service Provider API Documentation

## Overview

This API provides endpoints for managing and searching service provider data. The backend is built with **NestJS**, **PostgreSQL**, **TypeORM**, and implements **fuzzy search** using PostgreSQL's `pg_trgm` extension.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting an Admin Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `secret`

---

## Public Endpoints

### 1. Search Service Providers

**Endpoint:** `GET /providers/search`

**Description:** Search for service providers using fuzzy search with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Search query for fuzzy search across name, specialization, services, address, city |
| `province` | string | No | Filter by province (e.g., "القاهرة") |
| `city` | string | No | Filter by city (e.g., "مدينة نصر") |
| `specialization` | string | No | Filter by specialization (e.g., "علاج طبيعي") |
| `providerType` | string | No | Filter by provider type (e.g., "هيئة أطباء") |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |

**Example Requests:**

```bash
# Search for "جراحة" (surgery)
curl "http://localhost:3000/api/v1/providers/search?q=جراحة&limit=5"

# Filter by province
curl "http://localhost:3000/api/v1/providers/search?province=القاهرة&limit=10"

# Filter by specialization
curl "http://localhost:3000/api/v1/providers/search?specialization=علاج%20طبيعي"

# Combined search and filter
curl "http://localhost:3000/api/v1/providers/search?q=أسنان&province=القاهرة&page=1&limit=20"
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "providerName": "د محمد خالد صالح",
      "providerType": "هيئة أطباء",
      "servicesProvided": "خدمات خارجية",
      "specialization": "جراحة عظام وعمود فقري",
      "address": "الشارع الكبير أعلى معمل مكة امام بنك مصر - فايد",
      "city": "فايد",
      "province": "الإسماعيلية",
      "phoneNumber": "1022970221",
      "createdAt": "2025-10-18T04:02:59.935Z",
      "updatedAt": "2025-10-18T04:02:59.935Z"
    }
  ],
  "total": 4345,
  "page": 1,
  "limit": 20,
  "totalPages": 218
}
```

---

### 2. Get Filter Options

**Endpoint:** `GET /providers/filters`

**Description:** Get all available filter options (provinces, cities, specializations, provider types).

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/providers/filters"
```

**Response:**

```json
{
  "provinces": ["القاهرة", "الجيزة", "الإسكندرية", ...],
  "cities": ["مدينة نصر", "المهندسين", "المعادي", ...],
  "specializations": ["علاج طبيعي", "طب وجراحة الفم والأسنان", ...],
  "providerTypes": ["هيئة أطباء", "مراكز علاج طبيعي", ...]
}
```

**Statistics:**
- 29 Provinces
- 326 Cities
- 99 Specializations
- 12 Provider Types

---

### 3. Get Statistics

**Endpoint:** `GET /providers/statistics`

**Description:** Get statistics about service providers including total count and distribution.

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/providers/statistics"
```

**Response:**

```json
{
  "total": 4345,
  "byProvince": [
    {"province": "القاهرة", "count": 1403},
    {"province": "الجيزة", "count": 905},
    {"province": "الإسكندرية", "count": 325}
  ],
  "bySpecialization": [
    {"specialization": "تحاليل طبية", "count": 1185},
    {"specialization": "صيدلية", "count": 1075},
    {"specialization": "متعدد التخصصات", "count": 484}
  ]
}
```

---

### 4. Get Provider by ID

**Endpoint:** `GET /providers/:id`

**Description:** Get detailed information about a specific service provider.

**Example Request:**

```bash
curl "http://localhost:3000/api/v1/providers/8aad3ab6-50a4-4fa8-83c5-f0a7eff9e9d3"
```

**Response:**

```json
{
  "id": "8aad3ab6-50a4-4fa8-83c5-f0a7eff9e9d3",
  "providerName": "د. عبد الحميد عبد العظيم الغيطاني",
  "providerType": "مراكز علاج طبيعي",
  "servicesProvided": "خدمات خارجية",
  "specialization": "علاج طبيعي",
  "address": "2 ش علي جلال متفرع من ش الترولي - أمام سنترال المطرية",
  "city": "المطرية",
  "province": "القاهرة",
  "phoneNumber": "01119978900-01223400612",
  "createdAt": "2025-10-18T04:02:59.935Z",
  "updatedAt": "2025-10-18T04:02:59.935Z"
}
```

---

## Admin Endpoints

### 5. Upload Excel File

**Endpoint:** `POST /admin/providers/upload`

**Description:** Upload and import service providers from an Excel file.

**Authentication:** Required (Admin role)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Excel file (.xlsx or .xls)

**Example Request:**

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/api/v1/admin/providers/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/providers.xlsx"
```

**Response:**

```json
{
  "message": "File processed successfully",
  "imported": 4345,
  "failed": 0,
  "total": 4345
}
```

**File Requirements:**
- Format: `.xlsx` or `.xls`
- Max size: 10MB
- Required columns (in Arabic):
  - مقدم الخدمة (Provider Name)
  - نوع مقدم الخدمة (Provider Type)
  - الخدمات المقدمة (Services Provided)
  - التخصص (Specialization)
  - العنوان (Address)
  - المنطقة / المدينة (City)
  - المحافظة (Province)
  - Tel. no. - التليفون (Phone Number - optional)

---

### 6. Clear All Providers

**Endpoint:** `DELETE /admin/providers/clear`

**Description:** Delete all service providers from the database.

**Authentication:** Required (Admin role)

**Example Request:**

```bash
TOKEN="your_jwt_token_here"

curl -X DELETE http://localhost:3000/api/v1/admin/providers/clear \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "message": "All service providers have been cleared"
}
```

---

### 7. Delete Provider by ID

**Endpoint:** `DELETE /admin/providers/:id`

**Description:** Delete a specific service provider.

**Authentication:** Required (Admin role)

**Example Request:**

```bash
TOKEN="your_jwt_token_here"

curl -X DELETE http://localhost:3000/api/v1/admin/providers/8aad3ab6-50a4-4fa8-83c5-f0a7eff9e9d3 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "message": "Service provider deleted successfully"
}
```

---

## Fuzzy Search Implementation

The search functionality uses **PostgreSQL's pg_trgm extension** for fuzzy matching, which:

- Supports **Arabic text** search
- Calculates **similarity scores** across multiple fields
- Combines **trigram similarity** with **ILIKE pattern matching**
- Ranks results by **relevance**

**Search Fields (weighted):**
1. Provider Name (weight: 2.0)
2. Specialization (weight: 1.5)
3. Services Provided (weight: 1.0)
4. Address (weight: 0.5)
5. City (weight: 1.0)

**Minimum Similarity Threshold:** 0.1 (10%)

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only Excel files (.xlsx, .xls) are allowed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Service provider with ID xxx not found",
  "error": "Not Found"
}
```

---

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

---

## Database Schema

### service_provider Table

| Column | Type | Nullable | Indexed |
|--------|------|----------|---------|
| id | UUID | No | Primary Key |
| providerName | VARCHAR(500) | No | Yes |
| providerType | VARCHAR(200) | No | No |
| servicesProvided | VARCHAR(500) | No | Yes |
| specialization | VARCHAR(300) | No | Yes |
| address | TEXT | No | Yes |
| city | VARCHAR(200) | No | Yes |
| province | VARCHAR(200) | No | Yes |
| phoneNumber | VARCHAR(100) | Yes | No |
| createdAt | TIMESTAMP | No | No |
| updatedAt | TIMESTAMP | No | No |

**Indexes:**
- `idx_provider_name` on `providerName`
- `idx_services_provided` on `servicesProvided`
- `idx_specialization` on `specialization`
- `idx_address` on `address`
- `idx_city` on `city`
- `idx_province` on `province`

---

## Performance Considerations

- **Pagination:** Use `limit` and `page` parameters to avoid loading large datasets
- **Indexes:** All searchable fields are indexed for optimal query performance
- **Batch Import:** The upload endpoint processes files in batch for efficiency
- **Connection Pool:** Database connection pool size is configurable (default: 100)

---

## Testing Results

**Import Test:**
- ✅ Successfully imported 4,345 providers
- ✅ All 8 columns parsed correctly
- ✅ Arabic text handled properly

**Search Tests:**
- ✅ Fuzzy search: "جراحة" → 472 results
- ✅ Fuzzy search: "طبيعي" → 1,460 results
- ✅ Fuzzy search: "أسنان" → 650 results
- ✅ Filter by specialization: "علاج طبيعي" → 195 results
- ✅ Statistics endpoint: All 4,345 providers counted

---

## Next Steps for Frontend

1. **Authentication:** Implement login flow using `/auth/email/login`
2. **Search Interface:** Create search bar with real-time results
3. **Filters:** Add dropdowns for province, city, specialization
4. **Pagination:** Implement page navigation
5. **Provider Details:** Show full details on click
6. **Admin Panel:** File upload interface for admins

---

## Environment Variables

```env
NODE_ENV=development
APP_PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=api
```

---

## Running the Application

```bash
# Install dependencies
npm install

# Run migrations
npm run migration:run

# Seed admin user
npm run seed:run:relational

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## Support

For issues or questions, refer to the [NestJS Boilerplate Documentation](https://github.com/brocoders/nestjs-boilerplate).

