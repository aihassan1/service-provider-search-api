# Service Provider API Documentation

## Overview

This API provides endpoints for managing and searching service provider data with **admin authentication** for write operations. The backend is built with **NestJS**, **PostgreSQL**, **TypeORM**, and implements **fuzzy search** using PostgreSQL's `pg_trgm` extension.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Admin endpoints require **JWT authentication**. Include the token in the Authorization header:

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

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "tokenExpires": 1234567890,
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": {
      "id": 1,
      "name": "admin"
    }
  }
}
```

---

## Public Endpoints (No Authentication Required)

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
  "total": 472,
  "page": 1,
  "limit": 20,
  "totalPages": 24
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
    {"province": "الجيزة", "count": 905}
  ],
  "bySpecialization": [
    {"specialization": "تحاليل طبية", "count": 1185},
    {"specialization": "صيدلية", "count": 1075}
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

## Admin Endpoints (Authentication Required)

All admin endpoints require a valid JWT token with admin role.

### 5. Create Service Provider

**Endpoint:** `POST /admin/providers`

**Description:** Create a new service provider.

**Authentication:** Required (Admin role)

**Request Body:**

```json
{
  "providerName": "د. أحمد محمد",
  "providerType": "مستشفى",
  "servicesProvided": "خدمات خارجية",
  "specialization": "جراحة عامة",
  "address": "123 شارع الجامعة، الدور الثاني",
  "city": "مدينة نصر",
  "province": "القاهرة",
  "phoneNumber": "01234567890"
}
```

**Example Request:**

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/api/v1/admin/providers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "د. أحمد محمد",
    "providerType": "مستشفى",
    "servicesProvided": "خدمات خارجية",
    "specialization": "جراحة عامة",
    "address": "123 شارع الجامعة",
    "city": "مدينة نصر",
    "province": "القاهرة",
    "phoneNumber": "01234567890"
  }'
```

**Response:**

```json
{
  "message": "Service provider created successfully",
  "data": {
    "id": "new-uuid",
    "providerName": "د. أحمد محمد",
    "providerType": "مستشفى",
    "servicesProvided": "خدمات خارجية",
    "specialization": "جراحة عامة",
    "address": "123 شارع الجامعة",
    "city": "مدينة نصر",
    "province": "القاهرة",
    "phoneNumber": "01234567890",
    "createdAt": "2025-10-18T10:00:00.000Z",
    "updatedAt": "2025-10-18T10:00:00.000Z"
  }
}
```

---

### 6. Update Service Provider

**Endpoint:** `PUT /admin/providers/:id`

**Description:** Update an existing service provider.

**Authentication:** Required (Admin role)

**Request Body:** (All fields optional)

```json
{
  "providerName": "د. أحمد محمد المحدث",
  "specialization": "جراحة عظام",
  "phoneNumber": "01098765432"
}
```

**Example Request:**

```bash
TOKEN="your_jwt_token_here"

curl -X PUT http://localhost:3000/api/v1/admin/providers/8aad3ab6-50a4-4fa8-83c5-f0a7eff9e9d3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "د. أحمد محمد المحدث",
    "specialization": "جراحة عظام"
  }'
```

**Response:**

```json
{
  "message": "Service provider updated successfully",
  "data": {
    "id": "8aad3ab6-50a4-4fa8-83c5-f0a7eff9e9d3",
    "providerName": "د. أحمد محمد المحدث",
    "providerType": "مستشفى",
    "servicesProvided": "خدمات خارجية",
    "specialization": "جراحة عظام",
    "address": "123 شارع الجامعة",
    "city": "مدينة نصر",
    "province": "القاهرة",
    "phoneNumber": "01234567890",
    "createdAt": "2025-10-18T10:00:00.000Z",
    "updatedAt": "2025-10-18T11:00:00.000Z"
  }
}
```

---

### 7. Upload Excel File

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

### 8. Delete Service Provider

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

### 9. Clear All Providers

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

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
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

## CRUD Operations Summary

| Operation | Endpoint | Method | Auth Required | Description |
|-----------|----------|--------|---------------|-------------|
| **Create** | `/admin/providers` | POST | ✅ Admin | Create single provider |
| **Read (One)** | `/providers/:id` | GET | ❌ Public | Get provider by ID |
| **Read (Search)** | `/providers/search` | GET | ❌ Public | Search with filters |
| **Update** | `/admin/providers/:id` | PUT | ✅ Admin | Update provider |
| **Delete** | `/admin/providers/:id` | DELETE | ✅ Admin | Delete provider |
| **Bulk Import** | `/admin/providers/upload` | POST | ✅ Admin | Import from Excel |
| **Clear All** | `/admin/providers/clear` | DELETE | ✅ Admin | Delete all providers |

---

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

The Swagger UI provides:
- Interactive endpoint testing
- Request/response schemas
- Authentication testing
- Example requests

---

## Authentication Flow

### 1. Login as Admin

```bash
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

### 2. Extract Token

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  ...
}
```

### 3. Use Token in Requests

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/v1/admin/providers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"providerName":"Test",...}'
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider adding:

```typescript
// main.ts
import rateLimit from 'express-rate-limit';

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
```

---

## CORS Configuration

CORS is enabled for all origins by default. To restrict:

```typescript
// main.ts
app.enableCors({
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});
```

---

## Support

For questions or issues:
- Check [README.md](./README.md)
- Review [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- Open an issue on GitHub

---

**Last Updated**: October 18, 2025  
**API Version**: 1.0.0

