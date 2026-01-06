import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { Attendance } from '@minc-hub/shared/types'

interface CheckInWebSocketEvents {
  'checkin:connected': { userId: string; personId?: string | null }
  'checkin:success': { attendance: Attendance }
  'checkin:error': { message: string }
  'checkin:notify': { attendance: Attendance; message: string }
  'checkin:new': { attendance: Attendance }
}

export function useCheckInWebSocket(
  onCheckInSuccess?: (attendance: Attendance) => void,
  onCheckInNotify?: (attendance: Attendance) => void
) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const socketRef = useRef<Socket | null>(null)
  const isConnectedRef = useRef(false)

  const getToken = useCallback(() => {
    if (globalThis.window === undefined) return null
    return globalThis.window.localStorage.getItem('auth_token')
  }, [])

  const connect = useCallback(() => {
    const token = getToken()
    if (!token || !user || isConnectedRef.current) return

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const wsUrl = apiUrl.replace(/^https?:\/\//, '').split('/')[0]
    const protocol = apiUrl.startsWith('https') ? 'wss' : 'ws'

    const socket = io(`${protocol}://${wsUrl}/checkin`, {
      auth: {
        token,
      },
      query: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      isConnectedRef.current = true
    })

    socket.on('disconnect', () => {
      isConnectedRef.current = false
    })

    socket.on('checkin:connected', () => {
      // WebSocket authenticated successfully
    })

    socket.on('checkin:success', (data: CheckInWebSocketEvents['checkin:success']) => {
      if (onCheckInSuccess) {
        onCheckInSuccess(data.attendance)
      }
    })

    socket.on('checkin:notify', (data: CheckInWebSocketEvents['checkin:notify']) => {
      showToast(data.message, 'success')
      if (onCheckInNotify) {
        onCheckInNotify(data.attendance)
      }
    })

    socket.on('checkin:error', (data: CheckInWebSocketEvents['checkin:error']) => {
      showToast(data.message, 'error')
    })

    socket.on('checkin:new', () => {
      // This event is for schedule rooms, can be used for real-time updates
    })

    socketRef.current = socket
  }, [getToken, user, showToast, onCheckInSuccess, onCheckInNotify])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      isConnectedRef.current = false
    }
  }, [])

  const validateQrCode = useCallback(
    (qrCodeData: string) => {
      if (!socketRef.current || !isConnectedRef.current) {
        showToast('Conexão não estabelecida. Tentando reconectar...', 'warning')
        connect()
        return
      }

      socketRef.current.emit('checkin:validate-qr', { qrCodeData })
    },
    [connect, showToast]
  )

  const joinSchedule = useCallback((scheduleId: string) => {
    if (!socketRef.current || !isConnectedRef.current) {
      return
    }

    socketRef.current.emit('checkin:join-schedule', { scheduleId })
  }, [])

  const leaveSchedule = useCallback((scheduleId: string) => {
    if (!socketRef.current || !isConnectedRef.current) {
      return
    }

    socketRef.current.emit('checkin:leave-schedule', { scheduleId })
  }, [])

  useEffect(() => {
    const token = getToken()
    if (user && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user, getToken, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current,
    validateQrCode,
    joinSchedule,
    leaveSchedule,
    connect,
    disconnect,
  }
}
