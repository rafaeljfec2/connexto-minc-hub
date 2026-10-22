# Chat API - Endpoint and WebSocket Specification

## Overview

This document specifies the REST endpoints and WebSocket events required to implement the chat system on the backend, based on the mobile app implementation.

**Architecture:**

- **REST API**: For CRUD operations, listing, and history
- **WebSocket**: For real-time communication (required)
  - New messages
  - Read status
  - Typing indicator
  - Online/offline status
  - Conversation updates

## Data Models

### Message

```typescript
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string; // ISO 8601 format
  read: boolean;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Conversation

```typescript
interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### ChatUser (Chat Simplified)

```typescript
interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
}
```

## Endpoints

### 1. List Conversations

**GET** `/api/chat/conversations`

Returns the authenticated user's conversations, sorted by last message.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": [
    {
      "id": "conv-1",
      "participants": [
        {
          "id": "user-2",
          "name": "Ana Silva",
          "avatar": "https://example.com/avatar.jpg",
          "isOnline": true
        }
      ],
      "lastMessage": {
        "id": "msg-1",
        "text": "We need to align the Sunday schedule.",
        "senderId": "user-2",
        "timestamp": "2024-03-10T10:32:00Z",
        "read": false
      },
      "unreadCount": 1,
      "createdAt": "2024-03-01T10:00:00Z",
      "updatedAt": "2024-03-10T10:32:00Z"
    }
  ]
}
```

**Query Parameters:**

- `limit` (optional): Maximum number of conversations (default: 50)
- `offset` (optional): Pagination offset (default: 0)

---

### 2. Get Conversation Messages

**GET** `/api/chat/conversations/:conversationId/messages`

Returns messages for a specific conversation, sorted by timestamp (oldest first).

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": [
    {
      "id": "msg-1",
      "text": "Hi Rafael, how are you?",
      "senderId": "user-2",
      "timestamp": "2024-03-10T10:30:00Z",
      "read": true,
      "conversationId": "conv-1",
      "createdAt": "2024-03-10T10:30:00Z",
      "updatedAt": "2024-03-10T10:30:00Z"
    },
    {
      "id": "msg-2",
      "text": "Hi Ana! Great, and you?",
      "senderId": "user-1",
      "timestamp": "2024-03-10T10:31:00Z",
      "read": true,
      "conversationId": "conv-1",
      "createdAt": "2024-03-10T10:31:00Z",
      "updatedAt": "2024-03-10T10:31:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

**Query Parameters:**

- `limit` (optional): Maximum number of messages (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `before` (optional): ISO timestamp to load earlier messages (infinite scroll)

---

### 3. Send Message

**POST** `/api/chat/conversations/:conversationId/messages`

> **⚠️ DEPRECATED**: This REST endpoint is deprecated. Use the WebSocket `send-message` event to send messages in real time. This endpoint may be kept only for compatibility or special cases.

Creates a new message in a conversation.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "text": "Hello, how can I help?"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "msg-3",
    "text": "Hello, how can I help?",
    "senderId": "user-1",
    "timestamp": "2024-03-10T10:35:00Z",
    "read": false,
    "conversationId": "conv-1",
    "createdAt": "2024-03-10T10:35:00Z",
    "updatedAt": "2024-03-10T10:35:00Z"
  }
}
```

**Validation:**

- `text`: required, non-empty string, maximum 5000 characters
- `conversationId`: must exist and the user must be a participant

**Errors:**

- `400`: Empty or too long text
- `403`: User is not a conversation participant
- `404`: Conversation not found

---

### 4. Create or Get Conversation

**POST** `/api/chat/conversations`

Creates a new conversation between the authenticated user and another user, or returns the existing conversation.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "participantId": "user-2"
}
```

**Response 200 (existing conversation) or 201 (new conversation):**

```json
{
  "data": {
    "id": "conv-1",
    "participants": [
      {
        "id": "user-1",
        "name": "Rafael",
        "avatar": "https://example.com/avatar1.jpg",
        "isOnline": true
      },
      {
        "id": "user-2",
        "name": "Ana Silva",
        "avatar": "https://example.com/avatar2.jpg",
        "isOnline": true
      }
    ],
    "lastMessage": null,
    "unreadCount": 0,
    "createdAt": "2024-03-10T10:00:00Z",
    "updatedAt": "2024-03-10T10:00:00Z"
  }
}
```

**Validation:**

- `participantId`: required, must be a valid user ID different from the authenticated user

**Errors:**

- `400`: Invalid participantId or same as authenticated user
- `404`: Participant user not found

---

### 5. Mark Messages as Read

**PUT** `/api/chat/conversations/:conversationId/messages/read`

> **⚠️ DEPRECATED**: This REST endpoint is deprecated. Use the WebSocket `mark-read` event to mark messages as read in real time. This endpoint may be kept only for compatibility or special cases.

Marks all messages unread in a conversation as read.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": {
    "updatedCount": 3
  }
}
```

**Errors:**

- `403`: User is not a conversation participant
- `404`: Conversation not found

---

### 6. Get User Online Status

**GET** `/api/chat/users/:userId/status`

Returns the online status of a specific user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": {
    "userId": "user-2",
    "isOnline": true,
    "lastSeen": "2024-03-10T10:35:00Z"
  }
}
```

---

### 7. Get Unread Message Count

**GET** `/api/chat/conversations/unread-count`

Returns the total unread message count for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": {
    "totalUnread": 5
  }
}
```

## WebSocket (Required - Real-Time Communication)

Chat uses WebSocket for real-time communication. **ALL chat events (new messages, read status, typing, online status) MUST be sent over WebSocket.**

**IMPORTANT**: 
- **Sending messages**: Use only the WebSocket `send-message` event. Do NOT use the REST POST endpoint.
- **Mark as read**: Use only the WebSocket `mark-read` event. Do NOT use the REST PUT endpoint.
- **Receiving messages**: Messages are received only via the WebSocket `new-message` event.
- **Initial history**: The REST GET `/api/chat/conversations/:conversationId/messages` endpoint may be used ONLY to load initial history when a conversation is opened for the first time. After that, all messages must be received via WebSocket.

### WebSocket Connection

**URL:** `ws://localhost:3001/chat` (development) or `wss://api.example.com/chat` (production)

**Authentication:**
The client must send the JWT token in the connection header or as a query parameter:

- Header: `Authorization: Bearer <token>`
- Query: `?token=<jwt-token>`

**Connection:**

```javascript
const ws = new WebSocket('ws://localhost:3001/chat?token=YOUR_JWT_TOKEN');
```

### Client-to-Server Events

All events must follow the format:

```json
{
  "event": "nome-do-evento",
  "data": { ... }
}
```

1. **join-conversation**: Join a conversation (receive real-time updates)

   ```json
   {
     "event": "join-conversation",
     "data": {
       "conversationId": "conv-1"
     }
   }
   ```

   - The server must add the client to conversation room
   - The client will start receiving events for that conversation

2. **leave-conversation**: Leave a conversation (stop receiving updates)

   ```json
   {
     "event": "leave-conversation",
     "data": {
       "conversationId": "conv-1"
     }
   }
   ```

3. **send-message**: Send message via WebSocket (**REQUIRED - Use this method instead of REST**)

   ```json
   {
     "event": "send-message",
     "data": {
       "conversationId": "conv-1",
       "text": "Hello, how can I help?"
     }
   }
   ```

   - **This is the preferred and required method for sending messages**
   - The server must create the message and broadcast to all participants
   - Response: `new-message` event to all participants
   - **Do NOT use the REST POST `/api/chat/conversations/:conversationId/messages` endpoint to send messages**

4. **typing**: Indicate typing

   ```json
   {
     "event": "typing",
     "data": {
       "conversationId": "conv-1",
       "isTyping": true
     }
   }
   ```

   - Send `isTyping: true` when starting to type
   - Send `isTyping: false` when stopping (or after 3 seconds of inactivity)

5. **mark-read**: Mark messages as read via WebSocket (**REQUIRED - Use this method instead of REST**)
   ```json
   {
     "event": "mark-read",
     "data": {
       "conversationId": "conv-1",
       "messageIds": ["msg-1", "msg-2"] // optional; if omitted, marks all as read
     }
   }
   ```
   
   - **This is the preferred and required method for marking messages as read**
   - **Do NOT use the REST PUT `/api/chat/conversations/:conversationId/messages/read` endpoint to mark as read**

### Server-to-Client Events

All events follow the format:

```json
{
  "event": "nome-do-evento",
  "data": { ... },
  "timestamp": "2024-03-10T10:35:00Z"
}
```

1. **connected**: Successful connection confirmation

   ```json
   {
     "event": "connected",
     "data": {
       "userId": "user-1",
       "serverTime": "2024-03-10T10:35:00Z"
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Sent immediately after a successful connection
   - Confirms the user is authenticated and connected

2. **new-message**: New message received

   ```json
   {
     "event": "new-message",
     "data": {
       "id": "msg-3",
       "text": "Hello, how can I help?",
       "senderId": "user-2",
       "timestamp": "2024-03-10T10:35:00Z",
       "read": false,
       "conversationId": "conv-1"
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Sent to all conversation participants (except sender if needed)
   - Updates the conversation list on the client automatically

3. **message-read**: Message marked as read

   ```json
   {
     "event": "message-read",
     "data": {
       "conversationId": "conv-1",
       "messageIds": ["msg-1", "msg-2"],
       "readBy": "user-1"
     },
     "timestamp": "2024-03-10T10:36:00Z"
   }
   ```

   - Sent to all conversation participants
   - Enables real-time read indicator updates

4. **user-typing**: User is typing

   ```json
   {
     "event": "user-typing",
     "data": {
       "conversationId": "conv-1",
       "userId": "user-2",
       "userName": "Ana Silva",
       "isTyping": true
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Sent only to other participants (not to typing user)
   - The server must automatically send `isTyping: false` after 3 seconds of inactivity

5. **user-online-status**: User online status changed

   ```json
   {
     "event": "user-online-status",
     "data": {
       "userId": "user-2",
       "isOnline": true,
       "lastSeen": "2024-03-10T10:35:00Z"
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Sent to all users who have conversations with that user
   - Updated when the user connects/disconnects from WebSocket

6. **conversation-updated**: Conversation was updated (new message, participant change, etc.)

   ```json
   {
     "event": "conversation-updated",
     "data": {
       "conversationId": "conv-1",
       "lastMessage": {
         "id": "msg-3",
         "text": "Hello, how can I help?",
         "senderId": "user-2",
         "timestamp": "2024-03-10T10:35:00Z"
       },
       "unreadCount": 1
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Sent to all participants
   - Updates the conversation list without reloading

7. **error**: Error occurred
   ```json
   {
     "event": "error",
     "data": {
       "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
       "message": "Descriptive error message",
       "details": {}
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Sent when an error occurs processing an event
   - After an authentication error, the connection must be closed

## Suggested Database Schema

### Table: conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
```

### Table: messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;
```

### Table: user_online_status (Optional)

```sql
CREATE TABLE user_online_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_online_status_online ON user_online_status(is_online) WHERE is_online = TRUE;
```

## Business Rules

1. **Conversation Creation:**
   - A conversation can have 2 or more participants
   - If a conversation already exists between the same participants, return the existing one
   - The authenticated user is automatically added as a participant

2. **Sending Messages:**
   - Only conversation participants can send messages
   - Messages are created with `read: false` for all participants except the sender
   - The conversation is updated with the last message and timestamp

3. **Mark as Read:**
   - Only the recipient can mark messages as read
   - When marking as read, update the conversation `unreadCount`

4. **Online Status:**
   - Update `last_seen` whenever the user makes an authenticated request
   - Consider the user online if `last_seen` was updated in the last 5 minutes
   - Implement WebSocket heartbeat for real-time status

5. **Permissions:**
   - Users can only see conversations they participate in
   - Users can only send messages in conversations they participate in
   - Administrators can see all conversations (optional)

## Implementation Notes

1. **Pagination:**
   - Implement cursor-based pagination for better performance on large lists
   - Use `created_at` as the cursor for messages

2. **Performance:**
   - Índice `conversation_id` and `created_at` on the messages table
   - Cache conversation list with a short TTL (30-60 seconds)
   - Use Redis for real-time online status

3. **Security:**
   - Validate the user is a participant before returning conversation data
   - Sanitize message text to prevent XSS
   - Rate-limit message sending per user

4. **Push Notifications (Future):**
   - Send push notification when a new message arrives and the user is offline
   - Integrate with a push notification service (FCM, APNS)

## Usage Example

### Full Flow

1. **List conversations:**

   ```bash
   GET /api/chat/conversations
   ```

2. **Create/get conversation:**

   ```bash
   POST /api/chat/conversations
   Body: { "participantId": "user-2" }
   ```

3. **Send message:**

   ```bash
   POST /api/chat/conversations/conv-1/messages
   Body: { "text": "Hello!" }
   ```

4. **Get messages:**

   ```bash
   GET /api/chat/conversations/conv-1/messages
   ```

5. **Mark as read:**
   ```bash
   PUT /api/chat/conversations/conv-1/messages/read
   ```
