import { useEffect, MutableRefObject, useRef } from 'react'
import { ChatWebSocketService, Conversation, Message, User } from '@minc-hub/shared'

interface UseChatEventHandlersProps {
  chatSocket: ChatWebSocketService
  user: User | null
  activeConversationRef: MutableRefObject<Conversation | null>
  isOptimisticUpdateRef: MutableRefObject<boolean>
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
  loadConversations?: () => Promise<void>
}

// Helper function to calculate new unread count
function calculateUnreadCount(
  isActive: boolean,
  isSelf: boolean,
  isNewMessage: boolean,
  currentUnreadCount: number
): number {
  const shouldIncrement = !isActive && !isSelf && isNewMessage
  if (shouldIncrement) {
    return currentUnreadCount + 1
  }
  if (isActive || isSelf) {
    return 0
  }
  return currentUnreadCount
}

// Helper to process messages array for new message insertion
function processNewMessage(
  prev: Message[],
  message: Message,
  isOptimisticUpdateRef: MutableRefObject<boolean>
): Message[] {
  if (prev.some(m => m.id === message.id)) return prev

  const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.text === message.text)
  if (tempIndex !== -1) {
    const newMessages = [...prev]
    newMessages[tempIndex] = message
    isOptimisticUpdateRef.current = false
    return newMessages
  }

  return [...prev, message]
}

// Helper to update conversation with new message
function updateConversationWithMessage(
  conversation: Conversation,
  message: Message,
  userId: string | undefined,
  isActiveConversation: boolean
): Conversation {
  const isSelf = message.senderId === userId
  const isNewMessage = conversation.lastMessage?.id !== message.id
  const newUnreadCount = calculateUnreadCount(
    isActiveConversation,
    isSelf,
    isNewMessage,
    conversation.unreadCount ?? 0
  )

  return {
    ...conversation,
    lastMessage: message,
    unreadCount: newUnreadCount,
    updatedAt: message.createdAt,
  }
}

// Helper to mark messages as read
function markMessagesAsRead(
  messages: Message[],
  messageIds: string[] | undefined,
  currentUserId: string | undefined
): Message[] {
  return messages.map(msg => {
    if (messageIds && messageIds.length > 0) {
      return messageIds.includes(msg.id) ? { ...msg, read: true } : msg
    }
    if (msg.senderId === currentUserId && !msg.read) {
      return { ...msg, read: true }
    }
    return msg
  })
}

// Helper to update last message in conversations
function updateLastMessageInConversations(
  conversations: Conversation[],
  message: Message
): Conversation[] {
  return conversations.map(c => {
    if (c.id === message.conversationId && c.lastMessage?.id === message.id) {
      return { ...c, lastMessage: message }
    }
    return c
  })
}

// Helper to replace a message in messages array
function replaceMessageInArray(messages: Message[], newMessage: Message): Message[] {
  return messages.map(msg => (msg.id === newMessage.id ? newMessage : msg))
}

export function useChatEventHandlers({
  chatSocket,
  user,
  activeConversationRef,
  isOptimisticUpdateRef,
  setMessages,
  setActiveConversation,
  setConversations,
  loadConversations,
}: UseChatEventHandlersProps) {
  // Use refs to keep all values stable and avoid re-registering listeners
  const userRef = useRef(user)
  const loadConversationsRef = useRef(loadConversations)
  const setMessagesRef = useRef(setMessages)
  const setActiveConversationRef = useRef(setActiveConversation)
  const setConversationsRef = useRef(setConversations)

  // Keep refs updated
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    loadConversationsRef.current = loadConversations
  }, [loadConversations])

  useEffect(() => {
    setMessagesRef.current = setMessages
  }, [setMessages])

  useEffect(() => {
    setActiveConversationRef.current = setActiveConversation
  }, [setActiveConversation])

  useEffect(() => {
    setConversationsRef.current = setConversations
  }, [setConversations])

  // Register listeners only once when chatSocket changes
  useEffect(() => {
    const updateMessagesState = (message: Message) => {
      setMessagesRef.current(prev => processNewMessage(prev, message, isOptimisticUpdateRef))
    }

    const syncActiveConversation = (message: Message) => {
      setActiveConversationRef.current(prev => {
        if (!prev || prev.id !== message.conversationId) return prev
        const updated: Conversation = {
          ...prev,
          lastMessage: message,
          unreadCount: 0,
          updatedAt: message.createdAt,
        }
        activeConversationRef.current = updated
        return updated
      })
    }

    const handleConversationListUpdate = (
      prev: Conversation[],
      message: Message
    ): Conversation[] => {
      const existingConv = prev.find(c => c.id === message.conversationId)

      if (!existingConv && loadConversationsRef.current) {
        loadConversationsRef.current().catch(error => {
          console.error('Failed to reload conversations after new message', error)
        })
        return prev
      }

      if (existingConv?.lastMessage?.id === message.id) {
        return prev
      }

      const activeId = activeConversationRef.current?.id
      const userId = userRef.current?.id

      return prev
        .map(c => {
          if (c.id !== message.conversationId) return c
          return updateConversationWithMessage(c, message, userId, activeId === c.id)
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    const updateConversationList = (message: Message) => {
      setConversationsRef.current(prev => handleConversationListUpdate(prev, message))

      const currentActive = activeConversationRef.current
      if (currentActive?.id === message.conversationId) {
        syncActiveConversation(message)
      }
    }

    const handleNewMessage = (message: Message) => {
      const currentActive = activeConversationRef.current

      if (currentActive?.id === message.conversationId) {
        updateMessagesState(message)

        if (message.senderId !== userRef.current?.id) {
          chatSocket.markAsRead(currentActive.id, [message.id])
        }

        syncActiveConversation(message)
      }

      updateConversationList(message)
    }

    const handleConversationUpdated = (data: { conversationId: string; lastMessage: Message }) => {
      updateConversationList(data.lastMessage)
    }

    const handleMessageRead = (data: {
      conversationId: string
      readBy: string
      messageIds?: string[]
    }) => {
      const currentActive = activeConversationRef.current

      if (currentActive?.id === data.conversationId && data.readBy !== userRef.current?.id) {
        setMessagesRef.current(prev =>
          markMessagesAsRead(prev, data.messageIds, userRef.current?.id)
        )
      }
    }

    const handleMessageUpdate = (message: Message) => {
      const currentActive = activeConversationRef.current

      if (currentActive?.id === message.conversationId) {
        setMessagesRef.current(prev => replaceMessageInArray(prev, message))
      }

      setConversationsRef.current(prev => updateLastMessageInConversations(prev, message))
    }

    const handleMessageEdited = handleMessageUpdate
    const handleMessageDeleted = handleMessageUpdate

    const onReconnected = () => {
      const currentActive = activeConversationRef.current
      if (currentActive) {
        chatSocket.joinConversation(currentActive.id)
      }
    }

    // Register all listeners
    chatSocket.on('new-message', handleNewMessage)
    chatSocket.on('conversation-updated', handleConversationUpdated)
    chatSocket.on('message-read', handleMessageRead)
    chatSocket.on('message:edited', handleMessageEdited)
    chatSocket.on('message:deleted', handleMessageDeleted)
    chatSocket.on('connected', onReconnected)

    return () => {
      chatSocket.off('new-message', handleNewMessage)
      chatSocket.off('conversation-updated', handleConversationUpdated)
      chatSocket.off('message-read', handleMessageRead)
      chatSocket.off('message:edited', handleMessageEdited)
      chatSocket.off('message:deleted', handleMessageDeleted)
      chatSocket.off('connected', onReconnected)
    }
  }, [chatSocket, activeConversationRef, isOptimisticUpdateRef])
}
