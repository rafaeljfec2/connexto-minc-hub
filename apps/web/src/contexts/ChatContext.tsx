import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
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
    const token = localStorage.getItem('auth_token')
    console.log('[ChatContext] Checking connection requirements:', {
      hasToken: !!token,
      hasUser: !!user,
    })

    // We allow connection if user is present. If token is missing from storage,
    // we assume cookie-based auth will handle it (handled by gateway + withCredentials).
    if (user) {
      console.log('[ChatContext] Attempting to connect to WebSocket...')
      chatSocket.connect(token?.replace('Bearer ', '') || '')
      setIsConnected(chatSocket.isConnected())

      const onConnect = () => {
        console.log('[ChatContext] WebSocket Connected Event received')
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
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // If message belongs to active conversation, append it
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages(prev => [...prev, message])
        // Mark as read immediately if window is focused?
        // For simplicity, we might wait for user interaction or simplified read logic
      }

      // Update conversation list last message and unread count
      setConversations(prev => {
        return prev
          .map(c => {
            if (c.id === message.conversationId) {
              const isSelf = message.senderId === user?.id
              return {
                ...c,
                lastMessage: message,
                unreadCount:
                  activeConversation?.id === c.id || isSelf
                    ? c.unreadCount // If active, we theoretically read it? Or wait for markRead?
                    : c.unreadCount + 1,
                updatedAt: message.createdAt,
              }
            }
            return c
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })

      if (!activeConversation || activeConversation.id !== message.conversationId) {
        if (message.senderId !== user?.id) {
          setUnreadCount(prev => prev + 1)
        }
      }
    }

    chatSocket.on('new-message', handleNewMessage)
    return () => {
      chatSocket.off('new-message', handleNewMessage)
    }
  }, [chatSocket, activeConversation, user])

  // Active Conversation Management
  const handleSetActiveConversation = useCallback(
    async (conversation: Conversation | null) => {
      // Use functional state update to check previous value without adding dependency
      setActiveConversation(prevActive => {
        // If switching away from an active conversation, leave its room
        if (prevActive && (!conversation || prevActive.id !== conversation.id)) {
          chatSocket.leaveConversation(prevActive.id)
        }
        return conversation
      })

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
      console.log('[ChatContext] sendMessage called with:', text)
      if (!activeConversation) {
        console.warn('[ChatContext] sendMessage failed: No active conversation')
        return
      }
      try {
        console.log('[ChatContext] Sending message via socket to:', activeConversation.id)
        // Send via WebSocket to ensure real-time broadcast to all participants
        // The Gateway handles saving to DB and broadcasting 'new-message' event
        chatSocket.sendMessage(activeConversation.id, text)
      } catch (error) {
        console.error('Failed to send message', error)
      }
    },
    [activeConversation, chatSocket]
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

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
