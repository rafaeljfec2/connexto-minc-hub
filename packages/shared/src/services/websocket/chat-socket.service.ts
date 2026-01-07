import { io, Socket } from 'socket.io-client'

export interface ChatSocketEvents {
  'join-conversation': (data: { conversationId: string }) => void
  'leave-conversation': (data: { conversationId: string }) => void
  'send-message': (data: { conversationId: string; text: string }) => void
  'mark-read': (data: { conversationId: string; messageIds?: string[] }) => void
  typing: (data: { conversationId: string; isTyping: boolean }) => void
  connected: (data: { userId: string; serverTime: string }) => void
  'new-message': (data: any) => void // Typed as Message but loose for socket
  'message-read': (data: { conversationId: string; readBy: string; messageIds?: string[] }) => void
  'user-typing': (data: { conversationId: string; userId: string; isTyping: boolean }) => void
  'conversation-updated': (data: any) => void
  error: (data: { message: string }) => void
}

export class ChatWebSocketService {
  private socket: Socket | null = null
  private url: string

  constructor(url: string) {
    this.url = url
  }

  connect(token?: string) {
    if (this.socket?.connected) {
      console.log('[ChatWS] Already connected')
      return
    }

    const connectionUrl = `${this.url}/chat`
    console.log('[ChatWS] Connecting to:', connectionUrl)

    // Only include token in auth if it's provided and not empty
    // Otherwise, rely on cookie-based authentication
    const socketOptions: any = {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true, // Critical for cookie-based auth
    }

    if (token && token.trim().length > 0) {
      socketOptions.auth = { token: token.trim() }
    }

    this.socket = io(connectionUrl, socketOptions)

    this.socket.on('connect', () => {
      console.log('Chat WebSocket connected', this.socket?.id)
    })

    this.socket.on('connect_error', err => {
      console.error('Chat WebSocket connection error:', err)
    })

    this.socket.on('disconnect', () => {
      console.log('Chat WebSocket disconnected')
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join-conversation', { conversationId })
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave-conversation', { conversationId })
  }

  // Although sendMessage acts primarily via API, socket can be used too if preferred
  sendMessage(conversationId: string, text: string) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send message: socket not connected')
      return
    }
    this.socket?.emit('send-message', { conversationId, text })
  }

  markAsRead(conversationId: string, messageIds?: string[]) {
    this.socket?.emit('mark-read', { conversationId, messageIds })
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    this.socket?.emit('typing', { conversationId, isTyping })
  }

  on<K extends keyof ChatSocketEvents>(event: K, callback: ChatSocketEvents[K]) {
    this.socket?.on(event, callback as any)
  }

  off<K extends keyof ChatSocketEvents>(event: K, callback?: ChatSocketEvents[K]) {
    this.socket?.off(event, callback as any)
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}
