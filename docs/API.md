# API Documentation — Project Management System

Comprehensive reference for all REST API endpoints.

**Base URL**:
- Development: `http://localhost:5000/api`
- Production: `https://your-backend.onrender.com/api`

---

## 1. Authentication Endpoints

All protected endpoints require the following header:
```http
Authorization: Bearer <jwt_token>
```

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth**: Public (Rate-limited: 10 requests / 15 min / IP)
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c9b2e53a-4ef1-4822-b5b6-71df6fcfd512",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-07T12:00:00.000Z",
      "updatedAt": "2026-10-07T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Errors**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Invalid email, weak password (<8 chars or no number/letter), empty name.
  - `409 Conflict` (`CONFLICT`): An account with this email already exists.

---

### 1.2 Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth**: Public (Rate-limited: 10 requests / 15 min / IP)
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c9b2e53a-4ef1-4822-b5b6-71df6fcfd512",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-07T12:00:00.000Z",
      "updatedAt": "2026-10-07T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Errors**:
  - `401 Unauthorized` (`INVALID_CREDENTIALS`): "Invalid email or password." (Identical message to prevent user enumeration).
  - `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`): Exceeded 10 requests in 15 minutes.

---

### 1.3 Logout User
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  }
}
```

---

### 1.4 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c9b2e53a-4ef1-4822-b5b6-71df6fcfd512",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-07T12:00:00.000Z",
      "updatedAt": "2026-10-07T12:00:00.000Z"
    }
  }
}
```

---

## 2. Project Endpoints

All project operations are strictly scoped to the authenticated user (`req.user.userId`).

### 2.1 List Projects
- **Method**: `GET`
- **Path**: `/api/projects`
- **Auth**: Bearer Token
- **Query Parameters**:
  - `search` (string, optional): Case-insensitive search on name and description.
  - `status` (`NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`, optional): Filter by project status.
  - `page` (number, default: `1`): Page number.
  - `limit` (number, default: `20`, max: `100`): Items per page.
  - `sortBy` (`name` | `createdAt` | `updatedAt` | `status`, default: `createdAt`).
  - `sortOrder` (`asc` | `desc`, default: `desc`).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "e4f8d220-410a-413f-bd44-934c9c7198bb",
        "name": "Mobile App Launch",
        "description": "Cross-platform application built with React Native.",
        "status": "IN_PROGRESS",
        "startDate": "2026-10-01T00:00:00.000Z",
        "endDate": "2026-11-15T00:00:00.000Z",
        "userId": "c9b2e53a-4ef1-4822-b5b6-71df6fcfd512",
        "taskCount": 5,
        "completedTaskCount": 2,
        "createdAt": "2026-10-07T10:00:00.000Z",
        "updatedAt": "2026-10-07T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2.2 Get Single Project
- **Method**: `GET`
- **Path**: `/api/projects/:id`
- **Auth**: Bearer Token
- **Response `200 OK`**: Returns project with nested tasks.
- **Errors**:
  - `404 Not Found` (`NOT_FOUND`): If project does not exist or belongs to another user (strict isolation).

---

### 2.3 Create Project
- **Method**: `POST`
- **Path**: `/api/projects`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "name": "Website Redesign",
  "description": "Modern frontend with Tailwind CSS",
  "status": "IN_PROGRESS",
  "startDate": "2026-10-10T00:00:00.000Z",
  "endDate": "2026-12-01T00:00:00.000Z"
}
```
- **Response `201 Created`**

---

### 2.4 Update Project
- **Method**: `PUT`
- **Path**: `/api/projects/:id`
- **Auth**: Bearer Token
- **Request Body** (partial fields allowed):
```json
{
  "status": "COMPLETED"
}
```
- **Response `200 OK`**

---

### 2.5 Delete Project
- **Method**: `DELETE`
- **Path**: `/api/projects/:id`
- **Auth**: Bearer Token
- **Behavior**: Cascades and deletes all associated tasks automatically.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully."
  }
}
```

---

## 3. Task Endpoints

Ownership of tasks is validated via `Task → Project → User`.

### 3.1 List Tasks
- **Method**: `GET`
- **Path**: `/api/tasks`
- **Auth**: Bearer Token
- **Query Parameters**:
  - `projectId` (UUID, optional): Filter tasks by project.
  - `search` (string, optional): Case-insensitive search on task name and description.
  - `status` (`PENDING` | `IN_PROGRESS` | `COMPLETED`, optional).
  - `priority` (`LOW` | `MEDIUM` | `HIGH`, optional).
  - `page` (number, default: `1`).
  - `limit` (number, default: `20`).
- **Response `200 OK`**

---

### 3.2 Get Single Task
- **Method**: `GET`
- **Path**: `/api/tasks/:id`
- **Auth**: Bearer Token
- **Response `200 OK`**

---

### 3.3 Create Task
- **Method**: `POST`
- **Path**: `/api/tasks`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "name": "Design wireframes",
  "description": "Create Figma layouts for mobile and tablet views",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-10-25T00:00:00.000Z",
  "projectId": "e4f8d220-410a-413f-bd44-934c9c7198bb"
}
```
- **Response `201 Created`**
- **Errors**:
  - `404 Not Found` (`NOT_FOUND`): If the target project does not exist or belongs to another user.

---

### 3.4 Update Task (Includes "Mark as Completed")
- **Method**: `PUT`
- **Path**: `/api/tasks/:id`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
- **Response `200 OK`**

---

### 3.5 Delete Task
- **Method**: `DELETE`
- **Path**: `/api/tasks/:id`
- **Auth**: Bearer Token
- **Response `200 OK`**

---

## 4. Dashboard Endpoint

### 4.1 Get Dashboard Statistics
- **Method**: `GET`
- **Path**: `/api/dashboard`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProjects": 3,
      "completedProjects": 1,
      "projectsInProgress": 2,
      "totalTasks": 8,
      "completedTasks": 4,
      "pendingTasks": 2,
      "inProgressTasks": 2
    }
  }
}
```

---

## 5. Standard Error Format

All error responses return HTTP status code $\ge 400$ with machine-readable `code`:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed. Please check your input.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```
