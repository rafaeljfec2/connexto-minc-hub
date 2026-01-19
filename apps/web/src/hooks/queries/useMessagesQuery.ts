import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Message } from '@minc-hub/shared/types'
import { ChatApiService } from '@minc-hub/shared'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useAuth } from '@/contexts/AuthContext'

const chatApi = new ChatApiService(api)

export function useMessagesQuery(conversationId: string | null) {
  const { selectedChurch } = useChurch()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery<Message[], Error>({
    queryKey: ['messages', selectedChurch?.id, conversationId],
    queryFn: async () => {
      if (!conversationId || !user || !selectedChurch?.id) {
        return []
      }
      return chatApi.getMessages(conversationId)
    },
    enabled: !!conversationId && !!user && !!selectedChurch?.id,
  })

  // Helper para adicionar uma mensagem ao cache (chamado pelo WebSocket)
  const addMessageToCache = (message: Message) => {
    queryClient.setQueryData<Message[]>(['messages', selectedChurch?.id, conversationId], old => {
      if (!old) return [message]

      // Evitar duplicatas
      if (old.some(m => m.id === message.id)) return old

      // Se for uma mensagem temporária (optimistic update), substituir
      const tempIndex = old.findIndex(m => m.id.startsWith('temp-') && m.text === message.text)
      if (tempIndex !== -1) {
        const newMessages = [...old]
        newMessages[tempIndex] = message
        return newMessages
      }

      return [...old, message]
    })
  }

  // Helper para atualizar uma mensagem no cache (edição, deleção)
  const updateMessageInCache = (messageId: string, updater: (old: Message) => Message) => {
    queryClient.setQueryData<Message[]>(['messages', selectedChurch?.id, conversationId], old => {
      if (!old) return old
      return old.map(msg => (msg.id === messageId ? updater(msg) : msg))
    })
  }

  // Helper para marcar mensagens como lidas
  const markMessagesAsReadInCache = (messageIds?: string[]) => {
    queryClient.setQueryData<Message[]>(['messages', selectedChurch?.id, conversationId], old => {
      if (!old) return old
      return old.map(msg => {
        if (messageIds && messageIds.length > 0) {
          return messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        }
        if (msg.senderId === user?.id && !msg.read) {
          return { ...msg, read: true }
        }
        return msg
      })
    })
  }

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    addMessageToCache,
    updateMessageInCache,
    markMessagesAsReadInCache,
  }
}
