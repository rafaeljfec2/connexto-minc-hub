import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Conversation } from '@minc-hub/shared/types'
import { ChatApiService } from '@minc-hub/shared'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useAuth } from '@/contexts/AuthContext'

const chatApi = new ChatApiService(api)

export function useConversationsQuery() {
  const { selectedChurch } = useChurch()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery<Conversation[], Error>({
    queryKey: ['conversations', selectedChurch?.id, user?.id],
    queryFn: async () => {
      if (!user || !selectedChurch?.id) {
        return []
      }
      return chatApi.getConversations()
    },
    enabled: !!user && !!selectedChurch?.id,
  })

  // Helper para atualizar uma conversa específica no cache
  const updateConversationInCache = (
    conversationId: string,
    updater: (old: Conversation) => Conversation
  ) => {
    queryClient.setQueryData<Conversation[]>(
      ['conversations', selectedChurch?.id, user?.id],
      old => {
        if (!old) return old
        return old.map(conv => (conv.id === conversationId ? updater(conv) : conv))
      }
    )
  }

  // Helper para adicionar uma nova conversa ao cache
  const addConversationToCache = (conversation: Conversation) => {
    queryClient.setQueryData<Conversation[]>(
      ['conversations', selectedChurch?.id, user?.id],
      old => {
        if (!old) return [conversation]
        // Evitar duplicatas
        if (old.some(c => c.id === conversation.id)) return old
        return [conversation, ...old]
      }
    )
  }

  // Helper para ordenar conversas por última atualização
  const sortConversationsByLastUpdate = () => {
    queryClient.setQueryData<Conversation[]>(
      ['conversations', selectedChurch?.id, user?.id],
      old => {
        if (!old) return old
        return [...old].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      }
    )
  }

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateConversationInCache,
    addConversationToCache,
    sortConversationsByLastUpdate,
  }
}
