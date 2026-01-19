import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { useChurch } from './ChurchContext'
import { ChatWebSocketService, ChatApiService, Conversation, Message } from '@minc-hub/shared'
import { api } from '@/lib/api'
import { ChatContext } from '@/hooks/useChat'
import { useConversationsQuery } from '@/hooks/queries/useConversationsQuery'
import { useMessagesQuery } from '@/hooks/queries/useMessagesQuery'
import { useChatConnection } from './chat-logic/useChatConnection'
import { useChatEventHandlers } from './chat-logic/useChatEventHandlers'
import { useChatActions } from './chat-logic/useChatActions'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function ChatProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth()
  const { selectedChurch } = useChurch()
  const queryClient = useQueryClient()

  // React Query hooks
  const {
    conversations,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useConversationsQuery()

  // State
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)

  // Messages query for active conversation
  const { messages, isLoading: isLoadingMessages } = useMessagesQuery(
    activeConversation?.id ?? null
  )

  const unreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)
  }, [conversations])

  // Pagination State
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false)
  const [dummyLoadingState, setDummyLoadingState] = useState(false)

  // Wrapper para setIsLoadingMessages (usado por useChatActions)
  const setIsLoadingMessages = useCallback(
    (value: React.SetStateAction<boolean>) => {
      setDummyLoadingState(typeof value === 'function' ? value(dummyLoadingState) : value)
    },
    [dummyLoadingState]
  )

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

  // Loader para recarregar conversas (usado pelo WebSocket)
  const loadConversations = useCallback(async () => {
    if (!user) return
    await refetchConversations()
  }, [user, refetchConversations])

  // Setters que atualizam o cache do React Query
  const setMessages = useCallback(
    (updater: React.SetStateAction<Message[]>) => {
      const conversationId = activeConversationRef.current?.id
      if (!conversationId) return

      queryClient.setQueryData<Message[]>(['messages', selectedChurch?.id, conversationId], old => {
        if (!old) return []
        return typeof updater === 'function' ? updater(old) : updater
      })
    },
    [queryClient, selectedChurch?.id]
  )

  const setConversations = useCallback(
    (updater: React.SetStateAction<Conversation[]>) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations', selectedChurch?.id, user?.id],
        old => {
          if (!old) return []
          return typeof updater === 'function' ? updater(old) : updater
        }
      )
    },
    [queryClient, selectedChurch?.id, user?.id]
  )

  // 1. Connection Logic
  const { isConnected } = useChatConnection({ chatSocket, user })

  // 2. Event Handlers com integração React Query
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

  // 4. Actions
  const {
    sendMessage,
    handleSetActiveConversation,
    loadMoreMessages,
    startConversation,
    joinConversation,
    leaveConversation,
    createGroup,
    createGroupFromTeam,
    addParticipant,
    promoteToAdmin,
    removeParticipant,
    updateGroup,
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
      createGroupFromTeam,
      addParticipant,
      promoteToAdmin,
      removeParticipant,
      updateGroup,
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
      createGroupFromTeam,
      addParticipant,
      promoteToAdmin,
      removeParticipant,
      updateGroup,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
