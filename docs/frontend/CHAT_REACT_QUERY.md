# React Query Integration with Chat WebSocket

## 📋 Overview

The chat system now uses **React Query** for state management and cache, while keeping **real-time updates via WebSocket**.

## 🔧 How It Works

### 1. React Query Hooks

#### `useConversationsQuery`

Manages the user's conversation list.

```typescript
const {
  conversations,
  isLoading,
  refetch,
  updateConversationInCache,
  addConversationToCache,
  sortConversationsByLastUpdate,
} = useConversationsQuery()
```

**Cache Functions:**

- `updateConversationInCache(id, updater)` - Update a specific conversation
- `addConversationToCache(conversation)` - Add a new conversation
- `sortConversationsByLastUpdate()` - Reorder by last update

#### `useMessagesQuery`

Manages messages for a specific conversation.

```typescript
const {
  messages,
  isLoading,
  refetch,
  addMessageToCache,
  updateMessageInCache,
  markMessagesAsReadInCache,
} = useMessagesQuery(conversationId)
```

**Cache Functions:**

- `addMessageToCache(message)` - Add a new message (called by WebSocket)
- `updateMessageInCache(id, updater)` - Update message (edit/delete)
- `markMessagesAsReadInCache(ids?)` - Mark messages as read

### 2. WebSocket Integration

`ChatContexto` uses React Query to store data, but the **WebSocket continues to work normally** for real-time updates.

#### Update Flow:

```
WebSocket Event → Chat Event Handler → queryClient.setQueryData() → UI Updated
```

**WebSocket Events Handled:**

- `new-message` - New message received
- `conversation-updated` - Conversation updated
- `message-read` - Message marked as read
- `message:edited` - Message edited
- `message:deleted` - Message deleted

#### Integration Example:

```typescript
// In useChatEventHandlers.ts
const handleNewMessage = (message: Message) => {
  // Updates React Query cache via setMessages
  setMessages(prev => [...prev, message])

  // setMessages now uses queryClient.setQueryData internally
}
```

### 3. Modified ChatContexto

`ChatContexto` now:

1. **Uses React Query** to fetch and cache data
2. **Keeps WebSocket** for real-time updates
3. **Syncs** WebSocket with React Query cache via `setMessages` and `setConversations`

```typescript
// Setters updated to use React Query
const setMessages = useCallback(
  updater => {
    queryClient.setQueryData(['messages', selectedChurch?.id, conversationId], old =>
      typeof updater === 'function' ? updater(old) : updater
    )
  },
  [queryClient, selectedChurch?.id]
)
```

## ✅ Benefits

### 1. **Smart Cache**

- Conversations and messages are cached
- Fewer API calls
- Faster navigation between conversations

### 2. **Real-Time WebSocket**

- Messages arrive instantly
- Real-time read indicators
- Edit/delete notifications

### 3. **Automatic Sync**

- WebSocket updates React Query cache
- UI always in sync
- No duplicate requests

### 4. **Performance**

- Only active conversations fetch messages
- Cache shared across components
- Smart invalidation

## 🎯 Query Keys

```typescript
// Conversations
;['conversations', churchId, userId][
  // Messages for a conversation
  ('messages', churchId, conversationId)
]
```

## 📊 Loading State

```typescript
const { conversations, isLoading } = useConversationsQuery()
// isLoading: true while fetching conversations

const { messages, isLoading } = useMessagesQuery(conversationId)
// isLoading: true while fetching messages
```

## 🔄 Full Message Flow

### Sending a Message:

1. User types and sends a message
2. `sendMessage()` sends via WebSocket
3. Optimistic update adds a temporary message to cache
4. Server processes and returns confirmed message
5. WebSocket emits `new-message` event
6. Event handler updates React Query cache
7. Temporary message is replaced with the real one
8. UI updates automatically

### Receiving a Message:

1. WebSocket receives `new-message` event
2. Event handler calls `setMessages()`
3. `setMessages()` updates cache via `queryClient.setQueryData()`
4. React Query notifies components
5. UI renders the new message
6. If conversation is active, marks as read automatically

## 🚀 How to Test

1. Open two browser tabs
2. Log in with different users
3. Start a conversation
4. Send messages from both sides
5. Observe real-time updates

## ⚠️ Important Considerations

### 1. **Do Not Remove WebSocket**

WebSocket is essential for real-time updates. React Query only manages cache; it does not replace real-time communication.

### 2. **Cache Invalidation**

Cache is updated automatically via WebSocket. Manual invalidation is not needed except in special cases.

### 3. **Unique Query Keys**

Always include `churchId` in query keys to avoid conflicts between different churches.

### 4. **Optimistic Updates**

Temporary messages are replaced when the server response arrives via WebSocket.

## 📝 Debug Logs

For debugging, you can check:

```typescript
// In Chrome DevTools
window.__REACT_QUERY_DEVTOOLS__

// Or use React Query DevTools (already integrated)
// Bottom-right corner of the screen
```

## 🔮 Future Improvements

- [ ] Implement `useMutation` for chat operations
- [ ] Add chat-specific retry logic
- [ ] Implement prefetching of recent conversations
- [ ] Cache persistence (localStorage)

---

**Last Updated**: January 2026
**Status**: ✅ Implemented and Working
