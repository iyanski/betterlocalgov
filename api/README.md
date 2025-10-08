# Headless Content Management System

[![npm version](https://img.shields.io/npm/v/headlesscontent.svg)](https://www.npmjs.com/package/headlesscontent)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/headlesscontent/ci.yml?branch=main)](https://github.com/your-username/headlesscontent/actions)
[![Dependency Status](https://img.shields.io/david/your-username/headlesscontent.svg)](https://david-dm.org/your-username/headlesscontent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, API-first headless content management system built with NestJS, TypeScript, and Prisma.

## 🚀 Features

- **🔐 Authentication & Authorization**: JWT-based authentication with role-based access control
- **👥 User Management**: Complete user CRUD operations with roles (OWNER, EDITOR, VIEWER)
- **🏢 Organization Management**: Multi-tenant support with organization isolation
- **📝 Content Types**: Dynamic content type definitions with flexible field system
- **📄 Content Management**: Create, read, update, delete content with publishing workflow
- **🏷️ Categories & Tags**: Organize content with categories and tags for better content management
- **🖼️ Media Management**: File upload and management with metadata
- **🗄️ Database**: SQLite for development, PostgreSQL ready for production
- **📚 API Documentation**: Interactive Swagger/OpenAPI documentation
- **🔍 Content Filtering**: Filter content by content type, status, categories, and tags

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma with migrations
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **File Upload**: Multer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install dependencies**:

```bash
git clone <repository-url>
cd headlesscontent
npm install
```

2. **Set up environment variables**:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up the database**:

```bash
npm run db:setup
```

4. **Start the development server**:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api/docs`

## 📚 API Documentation

### Authentication

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Organizations

- `GET /api/v1/organizations` - Get all organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/:id` - Get organization by ID
- `GET /api/v1/organizations/slug/:slug` - Get organization by slug
- `GET /api/v1/organizations/:id/users` - Get users in organization
- `PATCH /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization

### Users

- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Content Types

- `GET /api/v1/content-types` - Get all content types
- `POST /api/v1/content-types` - Create content type
- `GET /api/v1/content-types/:id` - Get content type by ID
- `GET /api/v1/content-types/slug/:slug` - Get content type by slug
- `PATCH /api/v1/content-types/:id` - Update content type
- `DELETE /api/v1/content-types/:id` - Delete content type

### Categories

- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories/:id` - Get category by ID
- `GET /api/v1/categories/slug/:slug` - Get category by slug
- `GET /api/v1/categories/:id/content` - Get content by category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Tags

- `GET /api/v1/tags` - Get all tags
- `POST /api/v1/tags` - Create tag
- `GET /api/v1/tags/:id` - Get tag by ID
- `GET /api/v1/tags/slug/:slug` - Get tag by slug
- `GET /api/v1/tags/:id/content` - Get content by tag
- `PATCH /api/v1/tags/:id` - Update tag
- `DELETE /api/v1/tags/:id` - Delete tag

### Content

- `GET /api/v1/content` - Get all content (with filtering)
- `POST /api/v1/content` - Create content
- `GET /api/v1/content/:id` - Get content by ID
- `GET /api/v1/content/slug/:slug` - Get content by slug
- `PATCH /api/v1/content/:id` - Update content
- `POST /api/v1/content/:id/publish` - Publish content
- `DELETE /api/v1/content/:id` - Delete content

#### Content Filtering

The content endpoint supports various query parameters:

- `contentTypeId` - Filter by content type
- `status` - Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `categoryId` - Filter by category
- `tagId` - Filter by tag
- `limit` - Number of items per page (default: 10)
- `offset` - Number of items to skip (default: 0)

Example:

```http
GET /api/v1/content?categoryId=123&status=PUBLISHED&limit=20
```

### Media

- `POST /api/v1/media/upload` - Upload file
- `GET /api/v1/media` - Get all media
- `GET /api/v1/media/:id` - Get media by ID
- `PATCH /api/v1/media/:id` - Update media metadata
- `DELETE /api/v1/media/:id` - Delete media

## 🏗️ Content Type System

The CMS uses a flexible content type system where you can define custom fields for different types of content.

### Field Types

- `text` - Single line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `boolean` - Checkbox
- `date` - Date picker
- `media` - File/media upload
- `select` - Dropdown selection

### Example Content Type

```json
{
  "name": "Blog Post",
  "slug": "blog-post",
  "description": "A blog post content type",
  "fields": [
    {
      "name": "title",
      "label": "Title",
      "type": "text",
      "required": true,
      "placeholder": "Enter the post title"
    },
    {
      "name": "content",
      "label": "Content",
      "type": "textarea",
      "required": true,
      "placeholder": "Write your blog post content here..."
    },
    {
      "name": "featuredImage",
      "label": "Featured Image",
      "type": "media",
      "required": false
    }
  ]
}
```

## 🏷️ Categories & Tags System

The CMS includes a robust categorization system:

### Categories

- **Hierarchical organization**: Group content by main topics
- **Color coding**: Each category can have a color for UI display
- **Content filtering**: Filter content by category
- **SEO friendly**: Categories have slugs for URL-friendly access

### Tags

- **Flexible labeling**: Add multiple tags to content
- **Color coding**: Each tag can have a color for UI display
- **Content filtering**: Filter content by tags
- **SEO friendly**: Tags have slugs for URL-friendly access

### Example Usage

```json
// Create content with categories and tags
{
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "content": {
    "title": "My Blog Post",
    "content": "This is my blog post content..."
  },
  "contentTypeId": "content-type-id",
  "categoryIds": ["category-1-id", "category-2-id"],
  "tagIds": ["tag-1-id", "tag-2-id", "tag-3-id"]
}
```

## 🗄️ Database Schema

### Core Tables

- `users` - User accounts and authentication
- `organizations` - Multi-tenant organizations
- `content_types` - Dynamic content type definitions
- `categories` - Content categories
- `tags` - Content tags
- `content` - Content entries
- `content_categories` - Many-to-many relationship between content and categories
- `content_tags` - Many-to-many relationship between content and tags
- `media` - File metadata
- `content_media` - Many-to-many relationship between content and media

### Relationships

- Users belong to organizations
- Content belongs to organizations
- Content can belong to multiple categories
- Content can have multiple tags
- Content can have multiple media files
- All entities track creator and updater information

## 🛠️ Development Scripts

```bash
# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:migrate      # Create and apply migrations
npm run db:migrate:deploy # Deploy migrations to production
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
npm run db:reset        # Reset database
npm run db:setup        # Full database setup (reset + seed)

# Development
npm run start:dev       # Start development server
npm run build           # Build for production
npm run start:prod      # Start production server
npm run test            # Run tests
npm run test:e2e        # Run end-to-end tests
npm run lint            # Run ESLint
```

## 🚀 Production Deployment

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/headlesscms"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=production

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"
```

### Steps

1. **Set up PostgreSQL database**
2. **Configure environment variables**
3. **Run database migrations**: `npm run db:migrate:deploy`
4. **Build the application**: `npm run build`
5. **Start the server**: `npm run start:prod`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
