import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useAuth } from './AuthContext'
import { ChatWebSocketService, ChatApiService, Conversation, Message } from '@minc-hub/shared'
// We need to instantiate services. Ideally this comes from a DI container or a configured instance.
// For now we will instantiate them here or outside.
import { api } from '@/lib/api' // Assuming this is the configured axios instance

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface ChatContextType {
  conversations: Conversation[]
  activeConversation: Conversation | null
  setActiveConversation: (conversation: Conversation | null) => void
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  unreadCount: number
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  startConversation: (participantId: string) => Promise<Conversation>
  isConnected: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Memoize services
  const chatApi = useMemo(() => new ChatApiService(api), [])
  const chatSocket = useMemo(() => new ChatWebSocketService(SOCKET_URL), [])

  // Connect/Disconnect Socket
  useEffect(() => {
    if (!user) return

    // Get token from storage or from API instance
    let token = localStorage.getItem('auth_token')

    // If token has 'Bearer ' prefix, remove it
    if (token) {
      token = token.replace('Bearer ', '').trim()
    }

    // If no token in localStorage, try to get from API instance headers
    if (!token && api.defaults.headers.common['Authorization']) {
      const authHeader = api.defaults.headers.common['Authorization'] as string
      token = authHeader.replace('Bearer ', '').trim()
    }

    // Only pass token if it exists and is valid (not empty)
    // If no token, pass undefined to use cookie-based auth
    const tokenToUse = token && token.trim().length > 0 ? token : undefined

    if (!tokenToUse) {
      console.log('[ChatContext] No token in localStorage. Will use cookie-based authentication.')
    }

    chatSocket.connect(tokenToUse)
    setIsConnected(chatSocket.isConnected())

    const onConnect = (data: { userId: string; serverTime: string }) => {
      console.log('[ChatContext] WebSocket connected:', data)
      setIsConnected(true)
    }

    const onError = (error: { message: string }) => {
      console.error('[ChatContext] WebSocket error:', error)
    }

    chatSocket.on('connected', onConnect)
    chatSocket.on('error', onError)

    return () => {
      chatSocket.off('connected', onConnect)
      chatSocket.off('error', onError)
      chatSocket.disconnect()
    }
  }, [chatSocket, user])

  // Load Conversations
  const loadConversations = useCallback(async () => {
    if (!user) return
    setIsLoadingConversations(true)
    try {
      const data = await chatApi.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [user, chatApi])

  const loadUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const { totalUnread } = await chatApi.getUnreadCount()
      setUnreadCount(totalUnread)
    } catch (error) {
      console.error('Failed to load unread count', error)
    }
  }, [user, chatApi])

  // Initial Data Load
  useEffect(() => {
    if (user) {
      loadConversations()
      loadUnreadCount()
    }
  }, [user, loadConversations, loadUnreadCount])

  // Handle Incoming Messages
  // Ref to access activeConversation inside socket listeners without triggering re-effects
  const activeConversationRef = useRef(activeConversation)
  // Ref to access messages to check if already loaded
  const messagesRef = useRef(messages)
  // Ref to prevent handleSetActiveConversation from fetching when we're doing optimistic updates
  const isOptimisticUpdateRef = useRef(false)
  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Handle Incoming Messages (Stable Listener)
  // Handle Incoming Messages (Stable Listener)
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      const currentActive = activeConversationRef.current

      // If message belongs to active conversation, append or swap it
      if (currentActive && message.conversationId === currentActive.id) {
        setMessages(prev => {
          // Check for existing real message (deduplicate)
          if (prev.find(m => m.id === message.id)) return prev

          // Check for optimistic message to replace (same text)
          const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.text === message.text)

          if (tempIndex !== -1) {
            // Swap in place to preserve order/scroll stability
            const newMessages = [...prev]
            newMessages[tempIndex] = message
            // Reset optimistic update flag when real message arrives
            isOptimisticUpdateRef.current = false
            return newMessages
          }

          // Else append
          return [...prev, message]
        })

        // If we are active, we read it immediately via WebSocket
        if (message.senderId !== user?.id) {
          chatSocket.markAsRead(currentActive.id, [message.id])
        }

        // SYNC ACTIVE CONVERSATION STATE (without triggering fetch)
        // Use direct state update to avoid triggering handleSetActiveConversation
        setActiveConversation(prev => {
          if (!prev) return null
          // Only update if the conversation ID matches
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
      } else {
        // Message received for a conversation that is not currently active
        // Still update the conversation list, but don't add to messages array
        // This ensures the conversation list shows the latest message even if not open
      }

      // Always update conversation list (for both active and inactive conversations)
      updateConversationList(message)
    }

    const handleConversationUpdated = (data: { conversationId: string; lastMessage: Message }) => {
      updateConversationList(data.lastMessage)
    }

    const updateConversationList = (message: Message) => {
      setConversations(prev => {
        // Optimization: Check if update is needed to avoid "refresh" flicker
        const existingConv = prev.find(c => c.id === message.conversationId)
        if (existingConv && existingConv.lastMessage?.id === message.id) {
          return prev // No change needed, prevent re-render
        }

        return prev
          .map(c => {
            if (c.id === message.conversationId) {
              const isSelf = message.senderId === user?.id
              const currentActive = activeConversationRef.current
              const isActive = currentActive?.id === c.id

              return {
                ...c,
                lastMessage: message,
                unreadCount: isActive || isSelf ? 0 : c.unreadCount + 1,
                updatedAt: message.createdAt,
              }
            }
            return c
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })

      // Sync active conversation to prevent stale state (without triggering fetch)
      const currentActive = activeConversationRef.current
      if (currentActive && currentActive.id === message.conversationId) {
        setActiveConversation(prev => {
          if (!prev || prev.id !== message.conversationId) return prev
          const updated = {
            ...prev,
            lastMessage: message,
            unreadCount: 0,
            updatedAt: message.createdAt,
          }
          activeConversationRef.current = updated
          return updated
        })
      }

      const activeId = currentActive?.id
      if ((!activeId || activeId !== message.conversationId) && message.senderId !== user?.id) {
        setUnreadCount(prev => prev + 1)
      }
    }

    chatSocket.on('new-message', handleNewMessage)
    chatSocket.on('conversation-updated', handleConversationUpdated)

    // Re-join room on reconnect
    const onReconnected = () => {
      const currentActive = activeConversationRef.current
      if (currentActive) {
        chatSocket.joinConversation(currentActive.id)
      }
    }
    chatSocket.on('connected', onReconnected)

    return () => {
      chatSocket.off('new-message', handleNewMessage)
      chatSocket.off('conversation-updated', handleConversationUpdated)
      chatSocket.off('connected', onReconnected)
    }
  }, [chatSocket, user])

  // Active Conversation Management
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

      // Additional check: if messages are already loaded for this conversation, don't fetch
      if (
        conversation &&
        messagesRef.current.length > 0 &&
        activeConversationRef.current?.id === conversation.id
      ) {
        // Just update the ref and return without fetching
        activeConversationRef.current = conversation
        return
      }

      // Use functional state update
      setActiveConversation(prevActive => {
        // If switching away from an active conversation, leave its room
        if (prevActive && (!conversation || prevActive.id !== conversation.id)) {
          chatSocket.leaveConversation(prevActive.id)
        }
        return conversation
      })

      // Update Ref immediately to block subsequent calls in same tick/render cycle
      activeConversationRef.current = conversation

      if (conversation) {
        setIsLoadingMessages(true)
        chatSocket.joinConversation(conversation.id)
        try {
          const msgs = await chatApi.getMessages(conversation.id)
          setMessages(msgs)

          // Mark as read via WebSocket
          if (conversation.unreadCount > 0) {
            chatSocket.markAsRead(conversation.id)
            // Update local state for conversation
            setConversations(prev =>
              prev.map(c => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
            )
            loadUnreadCount() // Refresh global count
          }
        } catch (error) {
          console.error('Failed to load messages', error)
        } finally {
          setIsLoadingMessages(false)
        }
      } else {
        setMessages([])
      }
    },
    [chatSocket, chatApi, loadUnreadCount]
  )

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
    [activeConversation, chatSocket, user]
  )

  const startConversation = useCallback(
    async (participantId: string) => {
      const conversation = await chatApi.startConversation(participantId)
      // Check if already in list
      if (!conversations.find(c => c.id === conversation.id)) {
        setConversations(prev => [conversation, ...prev])
      }
      return conversation
    },
    [chatApi, conversations]
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

  const value = useMemo(
    () => ({
      conversations,
      activeConversation,
      setActiveConversation: handleSetActiveConversation,
      messages,
      sendMessage,
      joinConversation,
      leaveConversation,
      unreadCount,
      isLoadingConversations,
      isLoadingMessages,
      startConversation,
      isConnected,
    }),
    [
      conversations,
      activeConversation,
      handleSetActiveConversation,
      messages,
      sendMessage,
      joinConversation,
      leaveConversation,
      unreadCount,
      isLoadingConversations,
      isLoadingMessages,
      startConversation,
      isConnected,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
