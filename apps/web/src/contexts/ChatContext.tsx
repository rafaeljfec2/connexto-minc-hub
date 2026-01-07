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
    // Get token directly from storage since it's not exposed in context
    // Get token directly from storage since it's not exposed in context
    const token = localStorage.getItem('auth_token')

    // We allow connection if user is present. If token is missing from storage,
    // we assume cookie-based auth will handle it (handled by gateway + withCredentials).
    if (user) {
      chatSocket.connect(token?.replace('Bearer ', '') || '')
      setIsConnected(chatSocket.isConnected())

      const onConnect = () => {
        setIsConnected(true)
      }

      chatSocket.on('connected', onConnect)

      return () => {
        chatSocket.off('connected', onConnect)
        chatSocket.disconnect()
      }
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
  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

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
            return newMessages
          }

          // Else append
          return [...prev, message]
        })

        // If we are active, we read it immediately
        if (message.senderId !== user?.id) {
          chatApi.markAsRead(currentActive.id, [message.id])
        }

        // SYNC ACTIVE CONVERSATION STATE
        setActiveConversation(prev =>
          prev
            ? {
                ...prev,
                lastMessage: message,
                unreadCount: 0,
                updatedAt: message.createdAt,
              }
            : null
        )
      }

      // Update conversation list logic
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

      // Sync active conversation to prevent stale state
      const currentActive = activeConversationRef.current
      if (currentActive && currentActive.id === message.conversationId) {
        setActiveConversation(prev =>
          prev
            ? {
                ...prev,
                lastMessage: message,
                unreadCount: 0,
                updatedAt: message.createdAt,
              }
            : null
        )
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
  }, [chatSocket, user, chatApi])

  // Active Conversation Management
  const handleSetActiveConversation = useCallback(
    async (conversation: Conversation | null) => {
      // Optimization: Check immediately against Ref to block redundant fetches
      if (conversation && activeConversationRef.current?.id === conversation.id) {
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

          // Mark as read
          if (conversation.unreadCount > 0) {
            await chatApi.markAsRead(conversation.id)
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

      // Update active conversation state immediately
      setActiveConversation(prev =>
        prev
          ? {
              ...prev,
              lastMessage: optimisticMessage,
              updatedAt: optimisticMessage.createdAt,
              unreadCount: 0,
            }
          : null
      )

      // Update Ref immediately to block any race-condition fetches from effects reacting to this change
      if (activeConversationRef.current) {
        activeConversationRef.current = {
          ...activeConversationRef.current,
          lastMessage: optimisticMessage,
          updatedAt: optimisticMessage.createdAt,
          unreadCount: 0,
        }
      }

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
      } catch (error) {
        console.error('Failed to send message', error)
        // Rollback on error could go here, but for now we assume success or socket reconnection handling it
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
