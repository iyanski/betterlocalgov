# Public API Documentation

This document describes the public-facing read-only API endpoints that allow access to published content without authentication.

## Base URL

All public endpoints are available at: `http://localhost:3000/api/v1/public`

## Authentication

**No authentication required** - These endpoints are designed for public access to published content.

## Organization-Based Access

All endpoints require an `organizationSlug` parameter to filter content by organization. This ensures content isolation between different organizations.

## Available Endpoints

### 1. Get Published Content

**GET** `/api/v1/public/content`

Retrieve a paginated list of published content.

#### Query Parameters

| Parameter          | Type   | Required | Description                                   |
| ------------------ | ------ | -------- | --------------------------------------------- |
| `organizationSlug` | string | Yes      | Organization slug to filter content           |
| `contentTypeId`    | string | No       | Filter by content type ID                     |
| `categoryId`       | string | No       | Filter by category ID                         |
| `tagId`            | string | No       | Filter by tag ID                              |
| `limit`            | number | No       | Number of items per page (1-100, default: 10) |
| `offset`           | number | No       | Number of items to skip (default: 0)          |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/public/content?organizationSlug=my-org&limit=20&offset=0" \
  -H "accept: application/json"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "clx1234567890abcdef",
      "title": "Sample Article",
      "slug": "sample-article",
      "content": {
        "body": "Article content...",
        "excerpt": "Article excerpt..."
      },
      "status": "PUBLISHED",
      "publishedAt": "2025-01-15T10:30:00Z",
      "contentType": {
        "id": "clx1234567890abcdef",
        "name": "Article",
        "slug": "article",
        "description": "Blog article content type"
      },
      "categories": [
        {
          "category": {
            "id": "clx1234567890abcdef",
            "name": "Technology",
            "slug": "technology",
            "description": "Technology articles",
            "color": "#3B82F6"
          }
        }
      ],
      "tags": [
        {
          "tag": {
            "id": "clx1234567890abcdef",
            "name": "JavaScript",
            "slug": "javascript",
            "description": "JavaScript related content",
            "color": "#EF4444"
          }
        }
      ],
      "media": [
        {
          "media": {
            "id": "clx1234567890abcdef",
            "filename": "hero-image.jpg",
            "originalName": "hero-image.jpg",
            "mimeType": "image/jpeg",
            "size": 1024000,
            "url": "https://example.com/uploads/hero-image.jpg"
          },
          "fieldName": "heroImage",
          "order": 0
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### 2. Get Content by ID

**GET** `/api/v1/public/content/:id`

Retrieve a specific published content item by its ID.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | Content ID  |

#### Query Parameters

| Parameter          | Type   | Required | Description       |
| ------------------ | ------ | -------- | ----------------- |
| `organizationSlug` | string | Yes      | Organization slug |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/public/content/clx1234567890abcdef?organizationSlug=my-org" \
  -H "accept: application/json"
```

### 3. Get Content by Slug

**GET** `/api/v1/public/content/slug/:slug`

Retrieve a specific published content item by its slug.

#### Path Parameters

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| `slug`    | string | Yes      | Content slug |

#### Query Parameters

| Parameter          | Type   | Required | Description       |
| ------------------ | ------ | -------- | ----------------- |
| `organizationSlug` | string | Yes      | Organization slug |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/public/content/slug/sample-article?organizationSlug=my-org" \
  -H "accept: application/json"
```

### 4. Get Categories

**GET** `/api/v1/public/categories`

Retrieve all active categories for an organization.

#### Query Parameters

| Parameter          | Type   | Required | Description       |
| ------------------ | ------ | -------- | ----------------- |
| `organizationSlug` | string | Yes      | Organization slug |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/public/categories?organizationSlug=my-org" \
  -H "accept: application/json"
```

#### Example Response

```json
[
  {
    "id": "clx1234567890abcdef",
    "name": "Technology",
    "slug": "technology",
    "description": "Technology articles",
    "color": "#3B82F6"
  },
  {
    "id": "clx1234567890abcdef",
    "name": "Design",
    "slug": "design",
    "description": "Design articles",
    "color": "#10B981"
  }
]
```

### 5. Get Tags

**GET** `/api/v1/public/tags`

Retrieve all active tags for an organization.

#### Query Parameters

| Parameter          | Type   | Required | Description       |
| ------------------ | ------ | -------- | ----------------- |
| `organizationSlug` | string | Yes      | Organization slug |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/public/tags?organizationSlug=my-org" \
  -H "accept: application/json"
```

### 6. Get Content Types

**GET** `/api/v1/public/content-types`

Retrieve all active content types for an organization.

#### Query Parameters

| Parameter          | Type   | Required | Description       |
| ------------------ | ------ | -------- | ----------------- |
| `organizationSlug` | string | Yes      | Organization slug |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/v1/public/content-types?organizationSlug=my-org" \
  -H "accept: application/json"
```

## Error Responses

### 404 Not Found

Returned when the organization is not found:

```json
{
  "message": "Organization not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 404 Not Found (Content)

Returned when the requested content is not found:

```json
{
  "message": "Content not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## Content Filtering

The content endpoints support filtering by:

- **Content Type**: Filter by specific content type ID
- **Category**: Filter by category ID
- **Tag**: Filter by tag ID
- **Pagination**: Control the number of results and offset

## Security Considerations

- Only **published** content with a `publishedAt` date is accessible
- Content is automatically filtered by organization
- No sensitive data (like user information) is exposed
- All endpoints are read-only

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse.

## CORS

CORS is enabled for the following origins by default:

- `http://localhost:3000`

You can configure additional origins via the `ALLOWED_ORIGINS` environment variable.
