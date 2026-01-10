import { AxiosInstance } from 'axios'
import { Conversation, Message, ApiResponse } from '../../types' // Adjust path if needed based on tsconfig

export interface GetConversationsParams {
  limit?: number
  offset?: number
}

export interface GetMessagesParams {
  limit?: number
  offset?: number
  before?: string
}

export class ChatApiService {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  // Allow setting a new client instance (e.g. if token changes)
  setClient(client: AxiosInstance) {
    this.client = client
  }

  async getConversations(params?: GetConversationsParams): Promise<Conversation[]> {
    const response = await this.client.get<ApiResponse<Conversation[]>>('/chat/conversations', {
      params,
    })
    return response.data.data || []
  }

  async getUnreadCount(): Promise<{ totalUnread: number }> {
    const response = await this.client.get<ApiResponse<{ totalUnread: number }>>(
      '/chat/conversations/unread-count'
    )
    return response.data.data || { totalUnread: 0 }
  }

  async startConversation(participantId: string): Promise<Conversation> {
    const response = await this.client.post<ApiResponse<Conversation>>('/chat/conversations', {
      participantId,
    })
    if (!response.data.data) {
      throw new Error('Failed to start conversation')
    }
    return response.data.data
  }

  async createGroup(name: string, members: string[]): Promise<Conversation> {
    const response = await this.client.post<ApiResponse<Conversation>>('/chat/groups', {
      name,
      members,
    })
    if (!response.data.data) {
      throw new Error('Failed to create group')
    }
    return response.data.data
  }

  async addParticipant(conversationId: string, participantId: string): Promise<Conversation> {
    const response = await this.client.post<ApiResponse<Conversation>>(
      `/chat/groups/${conversationId}/participants`,
      { participantId }
    )
    if (!response.data.data) {
      throw new Error('Failed to add participant')
    }
    return response.data.data
  }

  async getMessages(conversationId: string, params?: GetMessagesParams): Promise<Message[]> {
    const response = await this.client.get<ApiResponse<Message[]>>(
      `/chat/conversations/${conversationId}/messages`,
      { params }
    )
    return response.data.data || []
  }

  async promoteToAdmin(conversationId: string, participantId: string): Promise<Conversation> {
    const response = await this.client.post<ApiResponse<Conversation>>(
      `/chat/groups/${conversationId}/participants/${participantId}/promote`
    )
    if (!response.data.data) {
      throw new Error('Failed to promote participant')
    }
    return response.data.data
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const response = await this.client.post<ApiResponse<Message>>(
      `/chat/conversations/${conversationId}/messages`,
      { text }
    )
    if (!response.data.data) {
      throw new Error('Failed to send message')
    }
    return response.data.data
  }

  async markAsRead(
    conversationId: string,
    messageIds?: string[]
  ): Promise<{ updatedCount: number }> {
    const response = await this.client.put<ApiResponse<{ updatedCount: number }>>(
      `/chat/conversations/${conversationId}/messages/read`,
      { messageIds }
    )
    return response.data.data || { updatedCount: 0 }
  }
}
