import { createContext, useContext } from 'react'
import { Conversation, Message } from '@minc-hub/shared'

export interface AttachmentData {
  attachmentUrl: string
  attachmentName: string
  attachmentType: string
  attachmentSize: number
}

export interface ChatContextType {
  conversations: Conversation[]
  activeConversation: Conversation | null
  setActiveConversation: (conversation: Conversation | null) => void
  messages: Message[]
  sendMessage: (text: string, attachment?: AttachmentData) => Promise<void>
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  unreadCount: number
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  startConversation: (participantId: string) => Promise<Conversation>
  isConnected: boolean
  hasMoreMessages: boolean
  isLoadingMoreMessages: boolean
  loadMoreMessages: () => Promise<void>
  createGroup: (name: string, members: string[]) => Promise<Conversation>
  addParticipant: (conversationId: string, userId: string) => Promise<void>
  promoteToAdmin: (conversationId: string, userId: string) => Promise<void>
  removeParticipant: (conversationId: string, userId: string) => Promise<void>
  updateGroup: (conversationId: string, data: { name?: string; avatar?: string }) => Promise<void>
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
