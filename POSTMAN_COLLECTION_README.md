# Real Estate API Postman Collection

This collection provides a complete set of API endpoints for the Real Estate platform, including authentication, site settings, projects management, and blog functionality.

## Collection Overview

The collection is organized into logical groups:

1. **Authentication** - Admin authentication endpoints
2. **Site Settings** - General site configuration
3. **Language Settings** - Multi-language support configuration
4. **Projects Management** - All project-related operations
5. **Blogs Management** - Blog post creation and management

## Key Features

### Authentication
- Admin setup (first-time only)
- Admin registration with security key
- Login with automatic token management
- Password updates
- Logout functionality

### Site Settings
- Get all site settings with language support
- Update hero section with multi-language titles
- Update about us section with vision content
- **NEW: Update social media links** - Manage Facebook, Twitter, LinkedIn, Instagram, and YouTube links

### Language Settings
- Get current language settings
- Update supported languages and default language

### Projects Management
- Get all projects or filter by type
- Add, update, and delete projects
- Manage project gallery images
- Multi-language support for all project content

### Blogs Management
- Get all published blog posts
- Get specific blog post by ID
- Create new blog posts with featured images
- Update existing blog posts
- Delete blog posts with automatic Cloudinary cleanup

## Environment Variables

The collection uses the following variables:

- `{{baseUrl}}` - API base URL (default: http://localhost:3001/api/v1)
- `{{adminToken}}` - Authentication token (automatically set after login)
- `{{projectId}}` - Project ID (set when creating projects)
- `{{imageId}}` - Image ID (set when adding gallery images)
- `{{blogId}}` - Blog post ID (set when creating blog posts)

## Authentication Flow

1. **First-time setup**: Run "Admin Setup (First Time Only)" to create the initial admin account
2. **Login**: Run "Admin Login" to authenticate and automatically save the token
3. **Use protected endpoints**: All admin-only endpoints will automatically use the saved token
4. **Logout**: Run "Admin Logout" to clear the token

## New Social Media Links API

A new endpoint has been added to manage social media links:

**PUT** `/site-settings/social-media-links`

**Request Body:**
```json
{
  "facebook": "https://facebook.com/yourcompany",
  "twitter": "https://twitter.com/yourcompany",
  "linkedin": "https://linkedin.com/company/yourcompany",
  "instagram": "https://instagram.com/yourcompany",
  "youtube": "https://youtube.com/yourcompany"
}
```

This endpoint requires admin authentication and allows partial updates (you can update just one or multiple links at once).

## Blog API Features

The blog management section includes:

- Multi-language support for titles and content
- Cloudinary image integration for featured images
- Tag management
- Automatic read time calculation
- Published/unpublished status management

## Usage Tips

1. **Run requests in order**: For workflows like creating a project and then adding images, run the parent request first to set the ID variables
2. **Check response scripts**: Many requests include test scripts that automatically set variables for use in subsequent requests
3. **Use language parameters**: When getting site settings or projects, you can specify the language with the `lang` query parameter (en or ar)

## Error Handling

All requests include basic error logging in the test scripts. Check the Postman console for detailed error messages when requests fail.