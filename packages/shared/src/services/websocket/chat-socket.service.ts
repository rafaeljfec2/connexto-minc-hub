import { io, Socket } from 'socket.io-client'

export interface FileInfo {
  name: string
  size: number
  type: string
}

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
  'user-typing': (data: { conversationId: string; userId: string; isTyping: boolean }) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'conversation-updated': (data: any) => void
  error: (data: { message: string }) => void
  disconnect: (reason: string) => void
  // File Request Event (receiver requests file from sender)
  'file-request': (data: { fromUserId: string; fileInfo: FileInfo }) => void
  // WebRTC Signaling Events
  'webrtc-offer': (data: {
    fromUserId: string
    offer: RTCSessionDescriptionInit
    fileInfo: FileInfo
  }) => void
  'webrtc-answer': (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => void
  'webrtc-ice-candidate': (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => void
  'webrtc-rejected': (data: { fromUserId: string; reason: string }) => void
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

    // Only include token in auth if it's provided and not empty
    // Otherwise, rely on cookie-based authentication
    const socketOptions: any = {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true, // Critical for cookie-based auth
    }

    if (token && token.trim().length > 0) {
      // Validate token length before sending (JWT should be at least 50 chars)
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

  // ========================================
  // File Transfer Methods
  // ========================================

  /**
   * Request a file from another user (receiver calls this)
   * The sender will then initiate the WebRTC transfer
   */
  sendFileRequest(targetUserId: string, fileInfo: FileInfo) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send file request: socket not connected')
      return
    }
    this.socket.emit('file-request', { targetUserId, fileInfo })
  }

  // ========================================
  // WebRTC Signaling Methods for P2P File Transfer
  // ========================================

  /**
   * Send WebRTC offer to initiate P2P file transfer
   */
  sendWebRTCOffer(targetUserId: string, offer: RTCSessionDescriptionInit, fileInfo: FileInfo) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send WebRTC offer: socket not connected')
      return
    }
    this.socket.emit('webrtc-offer', { targetUserId, offer, fileInfo })
  }

  /**
   * Send WebRTC answer to accept P2P file transfer
   */
  sendWebRTCAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send WebRTC answer: socket not connected')
      return
    }
    this.socket.emit('webrtc-answer', { targetUserId, answer })
  }

  /**
   * Send ICE candidate for WebRTC connection establishment
   */
  sendICECandidate(targetUserId: string, candidate: RTCIceCandidateInit) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send ICE candidate: socket not connected')
      return
    }
    this.socket.emit('webrtc-ice-candidate', { targetUserId, candidate })
  }

  /**
   * Reject a WebRTC file transfer
   */
  sendWebRTCReject(targetUserId: string, reason?: string) {
    if (!this.socket?.connected) {
      console.error('[ChatWS] Cannot send WebRTC reject: socket not connected')
      return
    }
    this.socket.emit('webrtc-reject', { targetUserId, reason })
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
