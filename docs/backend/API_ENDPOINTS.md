# API Endpoints - MINC Teams

Complete documentation of all API endpoints.

## Base URL

```
http://localhost:3001
```

## Authentication

All endpoints (except `/auth/login` and `/auth/refresh-token`) require JWT authentication.

Tokens are sent automatically via HttpOnly cookies. Alternatively, you can use the header:

```
Authorization: Bearer <token>
```

---

## Authentication

### POST /auth/login

Logs in and returns HttpOnly cookies with tokens.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin",
    "isActive": true,
    "personId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Cookies:** `access_token`, `refresh_token` (HttpOnly)

---

### POST /auth/refresh-token

Refreshes authentication tokens.

**Body (optional):**
```json
{
  "refreshToken": "refresh-token-here"
}
```

Or use the `refresh_token` cookie.

**Response:** `200 OK`
```json
{
  "message": "Tokens refreshed successfully"
}
```

---

### POST /auth/logout

Logs out and clears cookies.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Logout successful"
}
```

---

### POST /auth/forgot-password

Requests password recovery.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password recovery email sent successfully"
}
```

---

### POST /auth/reset-password

Resets the password using the token received by email.

**Body:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-here",
  "password": "newPassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

### GET /auth/me

Returns information about the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin",
  "isActive": true,
  "personId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Churches

### GET /churches

Lists all churches.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "My City Church",
    "address": "123 Example St",
    "phone": "(11) 99999-9999",
    "email": "contato@church.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
]
```

---

### GET /churches/:id

Gets a church by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "My City Church",
  "address": "123 Example St",
  "phone": "(11) 99999-9999",
  "email": "contato@church.com",
  "ministries": [],
  "services": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /churches

Creates a new church.

**Body:**
```json
{
  "name": "My City Church",
  "address": "123 Example St",
  "phone": "(11) 99999-9999",
  "email": "contato@church.com"
}
```

**Response:** `201 Created`

---

### PATCH /churches/:id

Updates a church.

**Body:**
```json
{
  "name": "New Name",
  "phone": "(11) 88888-8888"
}
```

**Response:** `200 OK`

---

### DELETE /churches/:id

Deletes a church (soft delete).

**Response:** `200 OK`

---

## Ministries

### GET /ministries

Lists all ministries.

**Query Params:**
- `churchId` (optional) - Filter by church

**Response:** `200 OK`

---

### GET /ministries/:id

Gets a ministry by ID.

**Response:** `200 OK`

---

### POST /ministries

Creates a new ministry.

**Body:**
```json
{
  "name": "Welcome",
  "churchId": "church-uuid",
  "description": "Ministry responsible for welcoming visitors",
  "isActive": true
}
```

**Response:** `201 Created`

---

### PATCH /ministries/:id

Updates a ministry.

**Response:** `200 OK`

---

### DELETE /ministries/:id

Deletes a ministry (soft delete).

**Response:** `200 OK`

---

## Persons (Volunteers)

### GET /persons

Lists all persons.

**Query Params:**
- `ministryId` (optional) - Filter by ministry
- `teamId` (optional) - Filter by team

**Response:** `200 OK`

---

### GET /persons/:id

Gets a person by ID.

**Response:** `200 OK`

---

### POST /persons

Creates a new person.

**Body:**
```json
{
  "name": "John Silva",
  "ministryId": "ministry-uuid",
  "teamId": "team-uuid",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-01-01",
  "address": "123 Example St",
  "notes": "Notes"
}
```

**Response:** `201 Created`

---

### PATCH /persons/:id

Updates a person.

**Response:** `200 OK`

---

### DELETE /persons/:id

Deletes a person (soft delete).

**Response:** `200 OK`

---

## Services (Worship Services)

### GET /services

Lists all worship services.

**Query Params:**
- `churchId` (optional) - Filter by church

**Response:** `200 OK`

---

### GET /services/:id

Gets a worship service by ID.

**Response:** `200 OK`

---

### POST /services

Creates a new worship service.

**Body:**
```json
{
  "churchId": "church-uuid",
  "type": "sunday_morning",
  "dayOfWeek": 0,
  "time": "09:00:00",
  "name": "Morning Service",
  "isActive": true
}
```

**Types:** `sunday_morning`, `sunday_evening`, `wednesday`, `friday`, `special`

**Response:** `201 Created`

---

### PATCH /services/:id

Updates a worship service.

**Response:** `200 OK`

---

### DELETE /services/:id

Deletes a worship service (soft delete).

**Response:** `200 OK`

---

## Teams

### GET /teams

Lists all teams.

**Query Params:**
- `ministryId` (optional) - Filter by ministry

**Response:** `200 OK`

---

### GET /teams/:id

Gets a team by ID.

**Response:** `200 OK`

---

### POST /teams

Creates a new team.

**Body:**
```json
{
  "name": "Team A",
  "ministryId": "ministry-uuid",
  "leaderId": "leader-uuid",
  "description": "Team responsible for greeting",
  "isActive": true
}
```

**Response:** `201 Created`

---

### PATCH /teams/:id

Updates a team.

**Response:** `200 OK`

---

### DELETE /teams/:id

Deletes a team (soft delete).

**Response:** `200 OK`

---

### POST /teams/:id/members

Adds a member to team.

**Body:**
```json
{
  "personId": "person-uuid"
}
```

**Response:** `201 Created`

---

### GET /teams/:id/members

Lists team members.

**Response:** `200 OK`

---

### DELETE /teams/:id/members/:personId

Removes a member from the team.

**Response:** `200 OK`

---

## Schedules

### GET /schedules

Lists all schedules.

**Query Params:**
- `serviceId` (optional) - Filter by worship service
- `startDate` (optional) - Start date (YYYY-MM-DD)
- `endDate` (optional) - End date (YYYY-MM-DD)

**Response:** `200 OK`

---

### GET /schedules/:id

Gets a schedule by ID.

**Response:** `200 OK`

---

### POST /schedules

Creates a new schedule.

**Body:**
```json
{
  "serviceId": "service-uuid",
  "date": "2024-01-15",
  "teamIds": ["team-uuid-1", "team-uuid-2"]
}
```

**Response:** `201 Created`

---

### PATCH /schedules/:id

Updates a schedule.

**Response:** `200 OK`

---

### DELETE /schedules/:id

Deletes a schedule (soft delete).

**Response:** `200 OK`

---

### POST /schedules/:id/teams

Adds a team to schedule.

**Body:**
```json
{
  "teamId": "team-uuid"
}
```

**Response:** `201 Created`

---

### GET /schedules/:id/teams

Lists teams on the schedule.

**Response:** `200 OK`

---

### DELETE /schedules/:id/teams/:teamId

Removes a team from the schedule.

**Response:** `200 OK`

---

## Attendances (Check-ins)

### GET /attendances

Lists all check-ins.

**Query Params:**
- `scheduleId` (optional) - Filter by schedule
- `personId` (optional) - Filter by person

**Response:** `200 OK`

---

### GET /attendances/schedule/:scheduleId/stats

Gets attendance statistics for a schedule.

**Response:** `200 OK`
```json
{
  "total": 10,
  "present": 8,
  "absent": 2,
  "attendances": []
}
```

---

### GET /attendances/:id

Gets a check-in by ID.

**Response:** `200 OK`

---

### POST /attendances

Records a check-in.

**Body:**
```json
{
  "scheduleId": "schedule-uuid",
  "personId": "person-uuid",
  "method": "qr_code",
  "qrCodeData": {
    "qrCode": "abc123",
    "timestamp": "2024-01-15T10:00:00Z"
  },
  "absenceReason": null
}
```

**Methods:** `qr_code`, `manual`

**Response:** `201 Created`

---

### PATCH /attendances/:id

Updates a check-in.

**Response:** `200 OK`

---

### DELETE /attendances/:id

Deletes a check-in.

**Response:** `200 OK`

---

## Chat

> **Note:** For full Chat API specifications, see [CHAT_API.md](./CHAT_API.md)

The chat system enables communication between system users. Main endpoints:

- `GET /api/chat/conversations` - List user conversations
- `GET /api/chat/conversations/:id/messages` - Get messages for a conversation
- `POST /api/chat/conversations/:id/messages` - Send message
- `POST /api/chat/conversations` - Create or get conversation
- `PUT /api/chat/conversations/:id/messages/read` - Mark messages as read
- `GET /api/chat/users/:id/status` - Get user online status
- `GET /api/chat/conversations/unread-count` - Unread message count

For full details, request/response examples, database schema, and WebSocket specification, see [CHAT_API.md](./CHAT_API.md).

---

## Health Check

### GET /health

Checks API status.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict (e.g., duplicate)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Internal server error

---

## Swagger documentation

Access interactive documentation at:

```
http://localhost:3001/api/docs
```

---

## Usage Examples

### Create a church and its ministries

```bash
# 1. Create church
POST /churches
{
  "name": "My City Church"
}

# 2. Create ministry
POST /ministries
{
  "name": "Welcome",
  "churchId": "<church-id>"
}

# 3. Create team
POST /teams
{
  "name": "Team A",
  "ministryId": "<ministry-id>"
}
```

### Create a schedule and record check-ins

```bash
# 1. Create worship service
POST /services
{
  "churchId": "<church-id>",
  "type": "sunday_morning",
  "dayOfWeek": 0,
  "time": "09:00:00",
  "name": "Morning Service"
}

# 2. Create schedule
POST /schedules
{
  "serviceId": "<service-id>",
  "date": "2024-01-15",
  "teamIds": ["<team-id>"]
}

# 3. Record check-in
POST /attendances
{
  "scheduleId": "<schedule-id>",
  "personId": "<person-id>",
  "method": "qr_code"
}
```

---

**Last updated:** 2024-01-XX
