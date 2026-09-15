# Mobile API Integration

## Overview

The Flutter mobile application communicates with the backend through a centralized `ApiService`.

The API integration layer is responsible for:

- Sending HTTP requests
- Managing authentication headers
- Storing authentication tokens
- Handling API responses
- Handling request errors and timeouts
- Providing a single communication layer for the application

---

## API Configuration

The mobile application uses the following backend URL:

```text
https://pharmteck.up.railway.app
```

API requests are constructed by combining the base URL with the required endpoint.

```text
Base URL
    │
    ▼
https://pharmteck.up.railway.app
    │
    ▼
API Endpoint
```

---

## ApiService

All HTTP communication is centralized inside:

```text
lib/core/network/api_service.dart
```

`ApiService` is implemented as a singleton and provides the main HTTP methods used by the application.

```text
ApiService
├── GET
├── POST
└── PATCH
```

This prevents individual screens and Cubits from communicating directly with the HTTP client.

---

## Request Flow

The general API request flow is:

```text
Screen
   │
   ▼
Cubit / BLoC
   │
   ▼
Repository
   │
   ▼
ApiService
   │
   ▼
HTTP Request
   │
   ▼
Backend API
```

The response then follows the reverse path:

```text
Backend API
   │
   ▼
ApiService
   │
   ▼
Repository
   │
   ▼
Cubit / BLoC
   │
   ▼
Screen
```

---

## HTTP Methods

The `ApiService` currently supports:

| Method | Purpose                        |
| ------ | ------------------------------ |
| GET    | Retrieve data                  |
| POST   | Create data or perform actions |
| PATCH  | Update existing data           |

Requests use JSON for request and response data.

The default content type is:

```text
Content-Type: application/json
```

---

## Authentication

Protected requests use a Bearer token.

The token is stored locally using `SharedPreferences`.

```text
Authentication Response
          │
          ▼
       JWT Token
          │
          ▼
    SharedPreferences
          │
          ▼
     ApiService
          │
          ▼
Authorization: Bearer <token>
```

For authenticated requests, the following header is added:

```text
Authorization: Bearer <token>
```

---

## Token Management

The `ApiService` provides methods for managing the authentication session.

```text
saveToken()
clearToken()
hasToken
```

### Save Token

After successful login or registration, the received token is stored locally.

### Clear Token

During logout, the stored token is removed.

### Check Token

The application can check whether a stored authentication token exists before accessing protected functionality.

---

## Authentication Endpoints

The authentication repository currently uses the following endpoints:

### Register

```http
POST /api/auth/register
```

Example request:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "phone": "01000000000",
  "pharmacyName": "My Pharmacy",
  "role": "owner"
}
```

### Login

```http
POST /api/users/login
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Both authentication requests are sent without an existing authentication token.

---

## Response Handling

Successful responses use HTTP status codes in the `2xx` range.

If the response contains JSON data, it is decoded before being returned to the repository layer.

```text
HTTP Response
     │
     ▼
Status Code
     │
 ┌───┴────┐
 │        │
2xx     Error
 │        │
 ▼        ▼
Decode   ApiException
 │
 ▼
Repository
```

---

## Error Handling

API errors are represented using `ApiException`.

The exception can contain:

- Error message
- HTTP status code

The mobile application also converts common technical errors into user-friendly messages.

Examples include:

```text
Timeout
    ↓
Server is taking too long to respond

Network Error
    ↓
No internet connection
```

This prevents technical exceptions from being displayed directly to the user.

---

## Request Timeout

HTTP requests use a timeout of:

```text
20 seconds
```

If the backend does not respond within the configured timeout, the request fails and a user-friendly error message is returned.

---

## API Layer Responsibilities

| Component    | Responsibility                    |
| ------------ | --------------------------------- |
| Screen       | User interaction                  |
| Cubit / BLoC | Business logic and state          |
| Repository   | Feature-specific API operations   |
| ApiService   | HTTP requests and authentication  |
| Backend      | Data processing and authorization |

---

## API Integration Principles

The mobile API layer follows these principles:

- Centralized HTTP communication
- Repository-based API access
- Bearer token authentication
- Local token persistence
- JSON-based communication
- Centralized error handling
- Request timeout protection
- Separation between UI and network logic
