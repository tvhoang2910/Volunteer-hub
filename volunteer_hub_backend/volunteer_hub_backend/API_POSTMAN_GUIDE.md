# Volunteer Hub API Testing Guide (Postman)

## Base URL
```
http://localhost:8080
```

## Authentication Endpoints

### POST /api/auth/register
- **Method:** POST
- **Description:** User registration
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "name": "John Doe"
  }
  ```
- **Response:** Success message

### POST /api/auth/forgot-password
- **Method:** POST
- **Description:** Request password reset
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:** Success message

### POST /api/auth/reset-password
- **Method:** POST
- **Description:** Reset password with token
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "token": "reset-token-from-email",
    "password": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }
  ```
- **Response:** Success message

### POST /api/auth/login
- **Method:** POST
- **Description:** Login with email and password
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** Success message with session created

### POST /api/auth/logout
- **Method:** POST
- **Description:** Logout — invalidate the server session and clear the session cookie
- **Headers:**
  - `Content-Type: application/json` (optional)
  - Include cookies/credentials (send JSESSIONID)
- **Request Body:** none
- **Response:** JSON success message

### GET /api/auth/me
- **Method:** GET
- **Description:** Get information about the currently authenticated user
- **Headers:**
  - Include cookies/credentials (send JSESSIONID) or Authorization header if using token-based auth
- **Response:** JSON object with minimal user info, e.g.:
  ```json
  {
    "message": "Current user retrieved",
    "data": {
      "id": "uuid-of-user",
      "email": "user@example.com",
      "roles": ["ROLE_VOLUNTEER"]
    }
  }
  ```

## Dashboard Endpoints

### GET /api/dashboard
- **Method:** GET
- **Description:** Get dashboard data (requires OAuth2 authentication)
- **Headers:**
  - OAuth2 session required (handled by frontend)
- **Query Parameters:**
  - Optional pagination: `?page=0&size=10`

## Posts Endpoints

### GET /api/posts/visible
- **Method:** GET
- **Description:** Get paginated visible posts
- **Headers:**
  - OAuth2 session required (optional for public posts)
- **Query Parameters:**
  - `page` (default: 0)
  - `size` (default: 10)
  - `sort` (default: createdAt,desc)

## Admin Endpoints (Admin Role Required)

### GET /api/admin/events
- **Method:** GET
- **Description:** Get all events (admin view)
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Query Parameters:**
  - Optional pagination: `?page=0&size=10`

### PUT /api/admin/events/{id}/approve
- **Method:** PUT
- **Description:** Approve event
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Path Parameters:**
  - `id`: Event UUID

### PUT /api/admin/events/{id}/reject
- **Method:** PUT
- **Description:** Reject event
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Path Parameters:**
  - `id`: Event UUID

### DELETE /api/admin/events/{id}
- **Method:** DELETE
- **Description:** Delete event
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Path Parameters:**
  - `id`: Event UUID

### PUT /api/admin/users/{id}/lock
- **Method:** PUT
- **Description:** Lock user account
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Path Parameters:**
  - `id`: User UUID

### PUT /api/admin/users/{id}/unlock
- **Method:** PUT
- **Description:** Unlock user account
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Path Parameters:**
  - `id`: User UUID

### GET /api/admin/events/export
- **Method:** GET
- **Description:** Export events data
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Query Parameters:**
  - `format`: json, csv, xlsx (default: json)
  - `startDate`: YYYY-MM-DD (optional)
  - `endDate`: YYYY-MM-DD (optional)

### GET /api/admin/volunteers/export
- **Method:** GET
- **Description:** Export volunteers data
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Query Parameters:**
  - `format`: json, csv, xlsx (default: json)
  - `status`: ACTIVE, INACTIVE (optional)

### GET /api/admin/dashboard
- **Method:** GET
- **Description:** Get admin dashboard
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Query Parameters:**
  - Optional pagination: `?page=0&size=10`

### PUT /api/admin/cache/top-posts/refresh
- **Method:** PUT
- **Description:** Refresh top posts cache
- **Headers:**
  - OAuth2 session with ADMIN role required

### PUT /api/admin/cache/top-posts/invalidate
- **Method:** PUT
- **Description:** Invalidate top posts cache
- **Headers:**
  - OAuth2 session with ADMIN role required

### PUT /api/admin/cache/top-posts/rebuild-ranking
- **Method:** PUT
- **Description:** Rebuild post ranking
- **Headers:**
  - OAuth2 session with ADMIN role required

### GET /api/admin/cache/top-posts
- **Method:** GET
- **Description:** Get cached top posts
- **Headers:**
  - OAuth2 session with ADMIN role required
- **Query Parameters:**
  - `limit`: Number of posts to return (default: 10)

## Authentication Notes

**Important:** This application supports multiple authentication methods:

- **Email/Password Registration:** Use `/api/auth/register` to create accounts
- **Email/Password Login:** Use `/api/auth/login` for API-based authentication
- **Google OAuth2:** Use `/oauth2/authorization/google` for OAuth2 flow

For API testing, use `/api/auth/login` to authenticate and get session, then use that session for protected endpoints. OAuth2 requires browser for the authorization flow.

## Sample Test Data (from seed.sql)

### Test Users
- **Admin:** admin@example.com / Admin123!
- **Manager:** manager@example.com / Manager123!
- **Volunteers:** volunteer1@example.com to volunteer4@example.com / Volunteer123!

### Test Events
- 5 sample events with different statuses (PENDING, APPROVED, REJECTED)

### Test Posts
- 5 sample posts with reactions and comments

## Testing Workflow

1. **Register User:** Use `/api/auth/register` to create a test account
2. **Login:** Use `/api/auth/login` with email/password to authenticate
3. **Test Protected Endpoints:** Use the session from login to access `/api/dashboard`, `/api/admin/**`, etc.
4. **Google OAuth2:** For OAuth2 testing, use browser to `/oauth2/authorization/google`, then extract session for Postman

## Notes
- Most endpoints require OAuth2 authentication (not JWT tokens)
- Admin endpoints require ADMIN role from OAuth2
- Use query parameters for pagination (page, size) where applicable
- Export endpoints support format parameter (json, csv, etc.)
- Password requirements: min 8 chars, 1 uppercase, 1 number, 1 special character
- Authentication is handled through Google OAuth2, not API login endpoints