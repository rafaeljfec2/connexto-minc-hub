import { useEffect, useState } from 'react'
import { ChatWebSocketService, User } from '@minc-hub/shared'
import { api } from '@/lib/api'

interface UseChatConnectionProps {
  chatSocket: ChatWebSocketService
  user: User | null
}

export function useChatConnection({ chatSocket, user }: UseChatConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    // Get token from storage or from API instance
    let token = localStorage.getItem('auth_token')

    // If token has 'Bearer ' prefix, remove it
    if (token) {
      token = token.replace('Bearer ', '').trim()
    }

    // If no token in localStorage, try to get from API instance headers
    if (!token && api.defaults.headers.common['Authorization']) {
      const authHeader = api.defaults.headers.common['Authorization'] as string
      token = authHeader.replace('Bearer ', '').trim()
    }

    // Only pass token if it exists and is valid (not empty)
    // If no token, pass undefined to use cookie-based auth
    const tokenToUse = token && token.trim().length > 0 ? token : undefined

    chatSocket.connect(tokenToUse)

    // Initial check
    setIsConnected(chatSocket.isConnected())

    const onConnect = (_: { userId: string; serverTime: string }) => {
      setIsConnected(true)
    }

    const onError = (error: { message: string }) => {
      console.error('[ChatContext] WebSocket error:', error)
      setIsConnected(false)
    }

    // Also listen for disconnect
    const onDisconnect = () => {
      setIsConnected(false)
    }

    chatSocket.on('connected', onConnect)
    chatSocket.on('error', onError)
    chatSocket.on('disconnect', onDisconnect)

    return () => {
      chatSocket.off('connected', onConnect)
      chatSocket.off('error', onError)
      chatSocket.off('disconnect', onDisconnect)
      chatSocket.disconnect()
    }
  }, [chatSocket, user])

  return { isConnected }
}
