import { io, Socket } from 'socket.io-client'

export interface ChatSocketEvents {
  'join-conversation': (data: { conversationId: string }) => void
  'leave-conversation': (data: { conversationId: string }) => void
  'send-message': (data: { conversationId: string; text: string }) => void
  'mark-read': (data: { conversationId: string; messageIds?: string[] }) => void
  typing: (data: { conversationId: string; isTyping: boolean }) => void
  connected: (data: { userId: string; serverTime: string }) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'new-message': (data: any) => void
  'message-read': (data: { conversationId: string; readBy: string; messageIds?: string[] }) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'message:edited': (data: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'message:deleted': (data: any) => void
  'user-typing': (data: { conversationId: string; userId: string; isTyping: boolean }) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'conversation-updated': (data: any) => void
  error: (data: { message: string }) => void
  disconnect: (reason: string) => void
}

export class ChatWebSocketService {
  private socket: Socket | null = null
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  connect(token?: string) {
    if (this.socket?.connected) {
      console.log('[ChatWS] Already connected')
      return
    }

    const connectionUrl = `${this.url}/chat`
    console.log('[ChatWS] Connecting to:', connectionUrl, 'with token length:', token?.length || 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketOptions: any = {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true,
    }

    if (token && token.trim().length > 0) {
      if (token.trim().length < 50) {
        console.warn('[ChatWS] Token is too short, likely invalid. Will rely on cookie-based auth.')
      } else {
        socketOptions.auth = { token: token.trim() }
        console.log('[ChatWS] Using token-based auth (token length:', token.trim().length, ')')
      }
    } else {
      console.log('[ChatWS] No token provided, will use cookie-based authentication')
    }

    this.socket = io(connectionUrl, socketOptions)

    this.socket.on('connect', () => {
      console.log('Chat WebSocket connected', this.socket?.id)
    })

    this.socket.on('connect_error', (err: Error) => {
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

  sendMessage(
    conversationId: string,
    text: string,
    attachment?: {
      attachmentUrl: string
      attachmentName: string
      attachmentType: string
      attachmentSize: number
    }
  ) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send message: socket not connected')
      return
    }
    this.socket?.emit('send-message', { conversationId, text, ...attachment })
  }

  markAsRead(conversationId: string, messageIds?: string[]) {
    this.socket?.emit('mark-read', { conversationId, messageIds })
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    this.socket?.emit('typing', { conversationId, isTyping })
  }

  on<K extends keyof ChatSocketEvents>(event: K, callback: ChatSocketEvents[K]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket?.on(event, callback as any)
  }

  off<K extends keyof ChatSocketEvents>(event: K, callback?: ChatSocketEvents[K]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket?.off(event, callback as any)
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}
