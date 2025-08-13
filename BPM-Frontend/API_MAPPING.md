# API Endpoint Mapping

This document shows how the frontend services map to your backend API endpoints.

## Authentication Service (`auth.service.ts`)
**Base URL:** `/api/Authentication`

| Frontend Method | Backend Endpoint | HTTP Method | Description |
|----------------|------------------|-------------|-------------|
| `login()` | `/api/Authentication/login` | POST | User login |
| `register()` | `/api/Authentication/register` | POST | User registration |
| `refreshToken()` | `/api/Authentication/refresh-token` | POST | Refresh JWT token |
| `changePassword()` | `/api/Authentication/change-password` | POST | Change user password |
| `forgotPassword()` | `/api/Authentication/forgot-password` | POST | Request password reset |
| `resetPassword()` | `/api/Authentication/reset-password` | POST | Reset password with token |
| `getUserProfile()` | `/api/Authentication/profile` | GET | Get current user profile |

## User Service (`user.service.ts`)
**Base URL:** `/api/Authentication`

| Frontend Method | Backend Endpoint | HTTP Method | Description |
|----------------|------------------|-------------|-------------|
| `getUsers()` | `/api/Authentication/users` | GET | Get all users |
| `getUserById()` | `/api/Authentication/users/{id}` | GET | Get user by ID |
| `assignRole()` | `/api/Authentication/users/{userId}/roles/{roleName}` | POST | Assign role to user |
| `removeRole()` | `/api/Authentication/users/{userId}/roles/{roleName}` | DELETE | Remove role from user |
| `getUserRoles()` | `/api/Authentication/users/{userId}/roles` | GET | Get user roles |

## Request Service (`request.service.ts`)
**Base URL:** `/api/Request`

| Frontend Method | Backend Endpoint | HTTP Method | Description |
|----------------|------------------|-------------|-------------|
| `getRequests()` | `/api/Request` | GET | Get all requests |
| `createRequest()` | `/api/Request` | POST | Create new request |
| `getRequestById()` | `/api/Request/{id}` | GET | Get request by ID |
| `updateRequest()` | `/api/Request/{id}` | PUT | Update request |
| `deleteRequest()` | `/api/Request/{id}` | DELETE | Delete request |
| `getRequestSteps()` | `/api/Request/{id}/steps` | GET | Get request workflow steps |
| `getMyRequests()` | `/api/Request/my-requests` | GET | Get current user's requests |
| `getRequestsByStatus()` | `/api/Request/status/{status}` | GET | Get requests by status |
| `getPendingRequests()` | `/api/Request/pending-approvals` | GET | Get pending approval requests |
| `approveStep()` | `/api/Request/{requestId}/steps/{stepId}/approve` | POST | Approve request step |
| `rejectStep()` | `/api/Request/{requestId}/steps/{stepId}/reject` | POST | Reject request step |

## Workflow Service (`workflow.service.ts`)
**Base URL:** `/api/Workflow`

| Frontend Method | Backend Endpoint | HTTP Method | Description |
|----------------|------------------|-------------|-------------|
| `getWorkflows()` | `/api/Workflow` | GET | Get all workflows |
| `createWorkflow()` | `/api/Workflow` | POST | Create new workflow |
| `getActiveWorkflows()` | `/api/Workflow/active` | GET | Get active workflows |
| `getWorkflowById()` | `/api/Workflow/{id}` | GET | Get workflow by ID |
| `updateWorkflow()` | `/api/Workflow/{id}` | PUT | Update workflow |
| `deleteWorkflow()` | `/api/Workflow/{id}` | DELETE | Delete workflow |
| `getWorkflowSteps()` | `/api/Workflow/{id}/steps` | GET | Get workflow steps |
| `activateWorkflow()` | `/api/Workflow/{id}/activate` | PATCH | Activate workflow |
| `deactivateWorkflow()` | `/api/Workflow/{id}/deactivate` | PATCH | Deactivate workflow |

## Notification Service (`notification.service.ts`)
**Base URL:** `/api/Notification`

| Frontend Method | Backend Endpoint | HTTP Method | Description |
|----------------|------------------|-------------|-------------|
| `getNotifications()` | `/api/Notification` | GET | Get all notifications |
| `createNotification()` | `/api/Notification` | POST | Create new notification |
| `getNotificationById()` | `/api/Notification/{id}` | GET | Get notification by ID |
| `updateNotification()` | `/api/Notification/{id}` | PUT | Update notification |
| `deleteNotification()` | `/api/Notification/{id}` | DELETE | Delete notification |
| `getMyNotifications()` | `/api/Notification/my-notifications` | GET | Get current user's notifications |
| `getUnreadNotifications()` | `/api/Notification/unread` | GET | Get unread notifications |
| `getUnreadCount()` | `/api/Notification/unread-count` | GET | Get unread notification count |
| `markAsRead()` | `/api/Notification/{id}/mark-read` | PATCH | Mark notification as read |
| `markAllAsRead()` | `/api/Notification/mark-all-read` | PATCH | Mark all notifications as read |

## Additional Services

### File Upload Service (`file-upload.service.ts`)
**Note:** This service is ready but requires backend implementation for file handling.

### Reporting Service (`reporting.service.ts`)
**Note:** This service provides advanced reporting features but requires backend implementation.

## Environment Configuration

Make sure your `environment.ts` files have the correct API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-backend-url' // Update this to your actual backend URL
};
```

## CORS Configuration

Ensure your backend is configured to allow CORS requests from your Angular frontend domain.

## Authentication Headers

The `AuthInterceptor` automatically adds JWT tokens to requests. Make sure your backend validates these tokens properly.

## Error Handling

All services include error handling. The backend should return appropriate HTTP status codes and error messages.

## Data Models

The TypeScript models in `/src/app/core/models/` should match your backend DTOs. Update them as needed to match your actual backend response structures.
