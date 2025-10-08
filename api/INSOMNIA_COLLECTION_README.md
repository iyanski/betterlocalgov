# Headless CMS API - Insomnia Collection

This Insomnia collection contains all the API endpoints for the Headless CMS system, organized by functionality.

## Import Instructions

1. Open Insomnia
2. Click on "Create" → "Import from File"
3. Select the `headless-cms-insomnia-collection.json` file
4. The collection will be imported with all endpoints organized in folders

## Collection Structure

The collection is organized into the following folders:

### 🔐 Authentication

- **Login** - Authenticate and get JWT token

### 👥 Users

- Get All Users
- Create User
- Get User by ID
- Update User
- Delete User

### 🏢 Organizations

- Get All Organizations (OWNER only)
- Create Organization
- Get Organization by ID
- Get Organization by Slug
- Get Users in Organization
- Update Organization
- Delete Organization (OWNER only)

### 📝 Content Types

- Get All Content Types
- Create Content Type
- Get Content Type by ID
- Get Content Type by Slug
- Update Content Type
- Delete Content Type

### 📄 Content

- Get All Content (with filtering)
- Create Content
- Get Content by ID
- Get Content by Slug
- Update Content
- Publish Content
- Delete Content

### 🏷️ Categories

- Get All Categories
- Create Category

### 🏷️ Tags

- Get All Tags
- Create Tag

### 🖼️ Media

- Upload File
- Get All Media

### 🌐 Public (No Authentication Required)

- Get All Published Content
- Get Published Content by ID
- Get Published Content by Slug
- Get All Categories (Public)
- Get All Tags (Public)
- Get All Content Types (Public)

## Environment Variables

The collection includes a base environment with the following variables:

- `base_url` - API base URL (default: http://localhost:3000)
- `auth_token` - JWT authentication token (set after login)
- `organization_id` - Organization ID for requests
- `organization_slug` - Organization slug (default: "my-organization")
- `user_id` - User ID for user-specific requests
- `content_type_id` - Content type ID for content type requests
- `content_type_slug` - Content type slug (default: "blog-post")
- `content_id` - Content ID for content requests
- `content_slug` - Content slug (default: "my-first-blog-post")
- `category_id` - Category ID for category requests
- `tag_id` - Tag ID for tag requests

## Getting Started

1. **Start the API server**:

   ```bash
   npm run start:dev
   ```

2. **Import the collection** into Insomnia

3. **Set up authentication**:
   - Use the "Login" request with your credentials
   - Copy the JWT token from the response
   - Set the `auth_token` environment variable

4. **Create an organization**:
   - Use the "Create Organization" request
   - Copy the organization ID from the response
   - Set the `organization_id` environment variable

5. **Start testing** the other endpoints!

## Authentication Flow

1. **Login** with your credentials to get a JWT token
2. **Set the `auth_token`** environment variable with the token
3. **All authenticated requests** will automatically include the Bearer token

## Example Workflow

1. **Login** → Get JWT token
2. **Create Organization** → Get organization ID
3. **Create Content Type** → Get content type ID
4. **Create Category** → Get category ID
5. **Create Tag** → Get tag ID
6. **Create Content** → Get content ID
7. **Publish Content** → Make content public
8. **Test Public endpoints** → Verify public access

## Content Filtering

The content endpoints support various query parameters:

- `contentTypeId` - Filter by content type
- `status` - Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `categoryId` - Filter by category
- `tagId` - Filter by tag
- `limit` - Number of items per page (default: 10)
- `offset` - Number of items to skip (default: 0)

## File Upload

For media uploads:

1. Use the "Upload File" request
2. Select a file in the request body
3. The file will be uploaded and you'll get a media ID

## Public API

The public endpoints don't require authentication and are designed for:

- Frontend applications
- Public content consumption
- SEO-friendly content access

All public endpoints require an `organizationSlug` parameter to filter content by organization.

## Troubleshooting

- **401 Unauthorized**: Make sure you're logged in and the `auth_token` is set
- **403 Forbidden**: Check if your user has the required permissions
- **404 Not Found**: Verify the IDs in your environment variables
- **409 Conflict**: The resource already exists (e.g., duplicate slug)

## API Documentation

For detailed API documentation, visit: `http://localhost:3000/api/docs`
