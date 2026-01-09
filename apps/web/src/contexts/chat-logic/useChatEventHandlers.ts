import { useEffect, useCallback, MutableRefObject } from 'react'
import { ChatWebSocketService, Conversation, Message, User } from '@minc-hub/shared'

interface UseChatEventHandlersProps {
  chatSocket: ChatWebSocketService
  user: User | null
  activeConversationRef: MutableRefObject<Conversation | null>
  isOptimisticUpdateRef: MutableRefObject<boolean>
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
}

export function useChatEventHandlers({
  chatSocket,
  user,
  activeConversationRef,
  isOptimisticUpdateRef,
  setMessages,
  setActiveConversation,
  setConversations,
}: UseChatEventHandlersProps) {
  const updateMessagesState = useCallback(
    (message: Message) => {
      setMessages(prev => {
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
    },
    [setMessages, isOptimisticUpdateRef]
  )

  const syncActiveConversation = useCallback(
    (message: Message) => {
      setActiveConversation(prev => {
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
    },
    [setActiveConversation, activeConversationRef]
  )

  const updateConversationList = useCallback(
    (message: Message) => {
      setConversations(prev => {
        // Check if update is needed to avoid "refresh" flicker
        // Prefer .some over .find for simple existence check, but here we need the item to compare properties
        // const existingConv = prev.find(c => c.id === message.conversationId)

        // Only skip if we already processed this message ID specifically to avoid loops,
        // but verify unread count logic isn't bypassed incorrectly.
        // Actually, removing the optimization is safer to ensure state consistency.
        // if (existingConv && existingConv.lastMessage?.id === message.id) {
        //   return prev
        // }

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
        syncActiveConversation(message)
      }
    },
    [user, syncActiveConversation, setConversations, activeConversationRef]
  )

  const handleNewMessage = useCallback(
    (message: Message) => {
      const currentActive = activeConversationRef.current

      // If message belongs to active conversation, append or swap it
      if (currentActive && message.conversationId === currentActive.id) {
        updateMessagesState(message)

        // If we are active, we read it immediately via WebSocket
        if (message.senderId !== user?.id) {
          chatSocket.markAsRead(currentActive.id, [message.id])
        }

        // SYNC ACTIVE CONVERSATION STATE (without triggering fetch)
        syncActiveConversation(message)
      }

      // Always update conversation list (for both active and inactive conversations)
      updateConversationList(message)
    },
    [
      updateMessagesState,
      syncActiveConversation,
      updateConversationList,
      chatSocket,
      user,
      activeConversationRef,
    ]
  )

  const handleConversationUpdated = useCallback(
    (data: { conversationId: string; lastMessage: Message }) => {
      updateConversationList(data.lastMessage)
    },
    [updateConversationList]
  )

  const onReconnected = useCallback(() => {
    const currentActive = activeConversationRef.current
    if (currentActive) {
      chatSocket.joinConversation(currentActive.id)
    }
  }, [chatSocket, activeConversationRef])

  // Handle Incoming Messages (Stable Listener)
  useEffect(() => {
    chatSocket.on('new-message', handleNewMessage)
    chatSocket.on('conversation-updated', handleConversationUpdated)
    chatSocket.on('connected', onReconnected)

    return () => {
      chatSocket.off('new-message', handleNewMessage)
      chatSocket.off('conversation-updated', handleConversationUpdated)
      chatSocket.off('connected', onReconnected)
    }
  }, [chatSocket, handleNewMessage, handleConversationUpdated, onReconnected])
}
