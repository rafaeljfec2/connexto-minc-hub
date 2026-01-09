import { useCallback, MutableRefObject } from 'react'
import { ChatWebSocketService, ChatApiService, Conversation, Message, User } from '@minc-hub/shared'

interface UseChatActionsProps {
  chatSocket: ChatWebSocketService
  chatApi: ChatApiService
  user: User | null
  activeConversation: Conversation | null
  activeConversationRef: MutableRefObject<Conversation | null>
  isOptimisticUpdateRef: MutableRefObject<boolean>
  messages: Message[]
  messagesRef: MutableRefObject<Message[]>
  hasMoreMessages: boolean
  isLoadingMoreMessages: boolean
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>
  setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>
  setIsLoadingMoreMessages: React.Dispatch<React.SetStateAction<boolean>>
  loadUnreadCount?: () => void
  conversations: Conversation[]
}

export function useChatActions({
  chatSocket,
  chatApi,
  user,
  activeConversation,
  activeConversationRef,
  isOptimisticUpdateRef,
  messages,
  // messagesRef, // Not used strictly in these actions but good to have if needed
  hasMoreMessages,
  isLoadingMoreMessages,
  setMessages,
  setActiveConversation,
  setConversations,
  setIsLoadingMessages,
  setHasMoreMessages,
  setIsLoadingMoreMessages,
  // loadUnreadCount, // Removed
  conversations,
}: UseChatActionsProps) {
  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversation) return

      const tempId = `temp-${Date.now()}`
      const optimisticMessage: Message = {
        id: tempId,
        conversationId: activeConversation.id,
        senderId: user?.id || '',
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(), // Compatible with Message type
        read: false, // Compatible with Message type
      }

      // Optimistic Update
      setMessages(prev => [...prev, optimisticMessage])

      // Set flag to prevent handleSetActiveConversation from fetching
      isOptimisticUpdateRef.current = true

      // Update active conversation state immediately (without triggering handleSetActiveConversation)
      // Use direct state update to avoid triggering effects that might cause fetch
      setActiveConversation(prev => {
        if (!prev) return null
        const updated = {
          ...prev,
          lastMessage: optimisticMessage,
          updatedAt: optimisticMessage.createdAt,
          unreadCount: 0,
        }
        // Update Ref immediately to block any race-condition fetches
        activeConversationRef.current = updated
        return updated
      })

      // Also update conversation list optimistically
      setConversations(prev => {
        return prev
          .map(c => {
            if (c.id === activeConversation.id) {
              return {
                ...c,
                lastMessage: optimisticMessage,
                updatedAt: optimisticMessage.createdAt,
              }
            }
            return c
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })

      try {
        // Send via WebSocket
        // Ensure we are in the room (just in case)
        chatSocket.joinConversation(activeConversation.id)
        chatSocket.sendMessage(activeConversation.id, text)
        // Flag will be reset when the real message arrives via WebSocket
        // If no response comes within 5 seconds, reset flag as fallback
        setTimeout(() => {
          isOptimisticUpdateRef.current = false
        }, 5000)
      } catch (error) {
        console.error('Failed to send message', error)
        // Rollback on error
        isOptimisticUpdateRef.current = false
        setMessages(prev => prev.filter(m => m.id !== tempId))
      }
    },
    [
      activeConversation,
      chatSocket,
      user,
      setMessages,
      isOptimisticUpdateRef,
      setActiveConversation,
      activeConversationRef,
      setConversations,
    ]
  )

  const handleSetActiveConversation = useCallback(
    async (conversation: Conversation | null) => {
      // Optimization: Check immediately against Ref to block redundant fetches
      if (conversation && activeConversationRef.current?.id === conversation.id) {
        // If we're already viewing this conversation, don't fetch again
        // This prevents re-fetching when the conversation object reference changes but ID is the same
        // This is critical to prevent REST calls after sending messages
        return
      }

      // Prevent fetch if we're in the middle of an optimistic update
      if (
        isOptimisticUpdateRef.current &&
        conversation &&
        activeConversationRef.current?.id === conversation.id
      ) {
        return
      }

      // Update Ref immediately to block subsequent calls in same tick/render cycle
      activeConversationRef.current = conversation

      // Use functional state update
      setActiveConversation(prevActiveState => {
        // If switching away from an active conversation, leave its room
        if (prevActiveState && (!conversation || prevActiveState.id !== conversation.id)) {
          chatSocket.leaveConversation(prevActiveState.id)
        }
        return conversation
      })

      if (conversation) {
        setIsLoadingMessages(true)
        chatSocket.joinConversation(conversation.id)
        try {
          const msgs = await chatApi.getMessages(conversation.id)
          setMessages(msgs)
          setHasMoreMessages(msgs.length === 50)

          // Mark as read via WebSocket
          if (conversation.unreadCount > 0) {
            chatSocket.markAsRead(conversation.id)
            // Update local state for conversation
            setConversations(prev =>
              prev.map(c => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
            )
          }
        } catch (error) {
          console.error('Failed to load messages', error)
        } finally {
          setIsLoadingMessages(false)
        }
      } else {
        // When setting to null, ensure ref is also null
        activeConversationRef.current = null
        setMessages([])
        setHasMoreMessages(false)
      }
    },
    [
      chatSocket,
      chatApi,
      activeConversationRef,
      isOptimisticUpdateRef,
      setActiveConversation,
      setIsLoadingMessages,
      setMessages,
      setHasMoreMessages,
      setConversations,
    ]
  )

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || isLoadingMoreMessages || !hasMoreMessages || messages.length === 0)
      return

    setIsLoadingMoreMessages(true)
    const oldestMessage = messages[0]

    try {
      // Use the createdAt of the oldest message to fetch purely older messages
      const olderMessages = await chatApi.getMessages(activeConversation.id, {
        limit: 50,
        before: oldestMessage.createdAt,
      })

      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev])
        setHasMoreMessages(olderMessages.length === 50)
      } else {
        setHasMoreMessages(false)
      }
    } catch (error) {
      console.error('Failed to load more messages', error)
    } finally {
      setIsLoadingMoreMessages(false)
    }
  }, [
    activeConversation,
    chatApi,
    hasMoreMessages,
    isLoadingMoreMessages,
    messages,
    setIsLoadingMoreMessages,
    setMessages,
    setHasMoreMessages,
  ])

  const startConversation = useCallback(
    async (participantId: string) => {
      const conversation = await chatApi.startConversation(participantId)
      // Check if already in list
      if (!conversations.some(c => c.id === conversation.id)) {
        setConversations(prev => [conversation, ...prev])
      }
      return conversation
    },
    [chatApi, conversations, setConversations]
  )

  const joinConversation = useCallback(
    (conversationId: string) => {
      chatSocket.joinConversation(conversationId)
    },
    [chatSocket]
  )

  const leaveConversation = useCallback(
    (conversationId: string) => {
      chatSocket.leaveConversation(conversationId)
    },
    [chatSocket]
  )

  return {
    sendMessage,
    handleSetActiveConversation,
    loadMoreMessages,
    startConversation,
    joinConversation,
    leaveConversation,
  }
}
