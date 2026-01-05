# API Response Contract

This document describes the standardized response format for all API endpoints, following REST API best practices.

## Standard Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    // Response payload
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Church with ID abc123 not found",
  "errors": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches/abc123"
}
```

### Validation Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "name should not be empty",
    "email must be an email"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `statusCode` | number | HTTP status code |
| `message` | string | Human-readable message describing the result |
| `data` | object/array/null | Response data payload (only present on success) |
| `errors` | object/array/null | Error details (only present on failure) |
| `timestamp` | string | ISO 8601 timestamp of the response |
| `path` | string | Request path that generated this response |

## HTTP Status Codes

The API uses standard HTTP status codes:

- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests that create resources
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data or validation errors
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate entry)
- `500 Internal Server Error` - Server error

## Message Language

All response messages are in **English** to ensure consistency and international compatibility.

## Examples

### GET /minc-teams/v1/churches

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Minha Igreja",
      "address": "Rua Exemplo, 123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches"
}
```

### POST /minc-teams/v1/churches

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Operation completed successfully",
  "data": {
    "id": "uuid",
    "name": "Nova Igreja",
    "address": "Rua Nova, 456",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches"
}
```

### GET /minc-teams/v1/churches/invalid-id

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Church with ID invalid-id not found",
  "errors": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches/invalid-id"
}
```

### POST /minc-teams/v1/churches (with invalid data)

**Validation Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "name should not be empty",
    "address should not be empty"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/minc-teams/v1/churches"
}
```

## Implementation

The response format is automatically applied by:

1. **TransformResponseInterceptor** - Wraps successful responses in the standard format
2. **AllExceptionsFilter** - Formats error responses in the standard format

Both are registered globally in `AppModule`.

## Notes

- The `data` field is `undefined` (not included) when there's no data to return
- The `errors` field is `null` when there are no validation errors
- All timestamps are in ISO 8601 format (UTC)
- The `path` field reflects the actual request path, including query parameters if present
