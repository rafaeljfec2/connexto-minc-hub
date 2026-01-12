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
      setMessagesRef.current(prev => {
        if (prev.some(m => m.id === message.id)) return prev

        const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.text === message.text)

        if (tempIndex !== -1) {
          const newMessages = [...prev]
          newMessages[tempIndex] = message
          isOptimisticUpdateRef.current = false
          return newMessages
        }

        return [...prev, message]
      })
    }

    const syncActiveConversation = (message: Message) => {
      setActiveConversationRef.current(prev => {
        if (!prev) return null
        if (prev.id === message.conversationId) {
          const updated = {
            ...prev,
            lastMessage: message,
            unreadCount: 0,
            updatedAt: message.createdAt,
          }
          activeConversationRef.current = updated
          return updated
        }
        return prev
      })
    }

    const updateConversationList = (message: Message) => {
      setConversationsRef.current(prev => {
        const existingConv = prev.find(c => c.id === message.conversationId)

        // If conversation doesn't exist, reload the list to get it
        if (!existingConv && loadConversationsRef.current) {
          loadConversationsRef.current().catch(error => {
            console.error('Failed to reload conversations after new message', error)
          })
          return prev
        }

        // Skip if this message is already the last message (avoid duplicate updates)
        if (existingConv?.lastMessage?.id === message.id) {
          return prev
        }

        // Update existing conversation
        return prev
          .map(c => {
            if (c.id === message.conversationId) {
              const isSelf = message.senderId === userRef.current?.id
              const currentActive = activeConversationRef.current
              const isActive = currentActive?.id === c.id

              // Only increment if not active, not self, and message is new
              const shouldIncrement = !isActive && !isSelf && c.lastMessage?.id !== message.id
              const newUnreadCount = shouldIncrement
                ? (c.unreadCount ?? 0) + 1
                : isActive || isSelf
                  ? 0
                  : (c.unreadCount ?? 0)

              return {
                ...c,
                lastMessage: message,
                unreadCount: newUnreadCount,
                updatedAt: message.createdAt,
              }
            }
            return c
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })

      // Sync active conversation to prevent stale state
      const currentActive = activeConversationRef.current
      if (currentActive && currentActive.id === message.conversationId) {
        syncActiveConversation(message)
      }
    }

    const handleNewMessage = (message: Message) => {
      const currentActive = activeConversationRef.current

      // If message belongs to active conversation, append or swap it
      if (currentActive && message.conversationId === currentActive.id) {
        updateMessagesState(message)

        // If we are active, we read it immediately via WebSocket
        if (message.senderId !== userRef.current?.id) {
          chatSocket.markAsRead(currentActive.id, [message.id])
        }

        // SYNC ACTIVE CONVERSATION STATE
        syncActiveConversation(message)
      }

      // Always update conversation list
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

      // Only update if we're viewing this conversation and the reader is not us
      if (currentActive?.id === data.conversationId && data.readBy !== userRef.current?.id) {
        setMessagesRef.current(prev =>
          prev.map(msg => {
            // If messageIds are provided, only mark those specific messages
            if (data.messageIds && data.messageIds.length > 0) {
              if (data.messageIds.includes(msg.id)) {
                return { ...msg, read: true }
              }
              return msg
            }
            // If no messageIds, mark all messages from current user as read
            if (msg.senderId === userRef.current?.id && !msg.read) {
              return { ...msg, read: true }
            }
            return msg
          })
        )
      }
    }

    const handleMessageEdited = (message: Message) => {
      const currentActive = activeConversationRef.current

      // Update message in active conversation
      if (currentActive && message.conversationId === currentActive.id) {
        setMessagesRef.current(prev => prev.map(msg => (msg.id === message.id ? message : msg)))
      }

      // Update last message in conversation list if it's the edited message
      setConversationsRef.current(prev =>
        prev.map(c => {
          if (c.id === message.conversationId && c.lastMessage?.id === message.id) {
            return {
              ...c,
              lastMessage: message,
            }
          }
          return c
        })
      )
    }

    const handleMessageDeleted = (message: Message) => {
      const currentActive = activeConversationRef.current

      // Update message in active conversation
      if (currentActive && message.conversationId === currentActive.id) {
        setMessagesRef.current(prev => prev.map(msg => (msg.id === message.id ? message : msg)))
      }

      // Update last message in conversation list
      setConversationsRef.current(prev =>
        prev.map(c => {
          if (c.id === message.conversationId && c.lastMessage?.id === message.id) {
            return {
              ...c,
              lastMessage: message,
            }
          }
          return c
        })
      )
    }

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
