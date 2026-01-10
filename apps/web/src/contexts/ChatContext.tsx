import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useAuth } from './AuthContext'
import { ChatWebSocketService, ChatApiService, Conversation, Message } from '@minc-hub/shared'
import { api } from '@/lib/api'
import { ChatContext } from '@/hooks/useChat'
import { useChatConnection } from './chat-logic/useChatConnection'
import { useChatEventHandlers } from './chat-logic/useChatEventHandlers'
import { useChatActions } from './chat-logic/useChatActions'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const unreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)
  }, [conversations])

  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // Pagination State
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false)

  // Refs
  const activeConversationRef = useRef(activeConversation)
  const messagesRef = useRef(messages)
  const isOptimisticUpdateRef = useRef(false)

  // Sync refs
  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Services
  const chatApi = useMemo(() => new ChatApiService(api), [])
  const chatSocket = useMemo(() => new ChatWebSocketService(SOCKET_URL), [])

  // 3. Loaders (keep simple here)
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

  // 1. Connection Logic
  const { isConnected } = useChatConnection({ chatSocket, user })

  // 2. Event Handlers
  useChatEventHandlers({
    chatSocket,
    user,
    activeConversationRef,
    isOptimisticUpdateRef,
    setMessages,
    setActiveConversation,
    setConversations,
    loadConversations,
  })

  // Initial Data Load
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user, loadConversations])

  // 4. Actions
  const {
    sendMessage,
    handleSetActiveConversation,
    loadMoreMessages,
    startConversation,
    joinConversation,
    leaveConversation,
    createGroup,
    addParticipant,
  } = useChatActions({
    chatSocket,
    chatApi,
    user,
    activeConversation,
    activeConversationRef,
    isOptimisticUpdateRef,
    messages,
    messagesRef,
    hasMoreMessages,
    isLoadingMoreMessages,
    setMessages,
    setActiveConversation,
    setConversations,
    setIsLoadingMessages,
    setHasMoreMessages,
    setIsLoadingMoreMessages,
    conversations,
  })

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
      hasMoreMessages,
      isLoadingMoreMessages,
      loadMoreMessages,
      createGroup,
      addParticipant,
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
      hasMoreMessages,
      isLoadingMoreMessages,
      loadMoreMessages,
      createGroup,
      addParticipant,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
