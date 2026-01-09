import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  WebRTCFileTransferService,
  TransferProgress,
  FileInfo,
} from '@minc-hub/shared/services/webrtc/webrtc-file-transfer.service'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'

interface ReceivedFile {
  transferId: string
  blob: Blob
  fileInfo: FileInfo
  fromUserId: string
  receivedAt: Date
}

interface IncomingTransferRequest {
  transferId: string
  fromUserId: string
  fromUserName?: string
  fileInfo: FileInfo
}

interface FileTransferContextType {
  // State
  activeTransfers: TransferProgress[]
  receivedFiles: ReceivedFile[]
  incomingRequest: IncomingTransferRequest | null

  // Actions
  sendFile: (targetUserId: string, file: File) => Promise<string>
  acceptTransfer: (transferId: string) => void
  rejectTransfer: (transferId: string) => void
  cancelTransfer: (transferId: string) => void
  downloadFile: (transferId: string) => void
  clearReceivedFile: (transferId: string) => void
  registerFileForSharing: (file: File) => void
  requestFile: (senderId: string, fileInfo: FileInfo) => Promise<void>
}

const FileTransferContext = createContext<FileTransferContextType | undefined>(undefined)

export function useFileTransfer() {
  const context = useContext(FileTransferContext)
  if (!context) {
    throw new Error('useFileTransfer must be used within a FileTransferProvider')
  }
  return context
}

interface FileTransferProviderProps {
  readonly children: React.ReactNode
  readonly chatSocket: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (event: any, callback: any) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off: (event: any, callback?: any) => void
    sendFileRequest: (targetUserId: string, fileInfo: FileInfo) => void
    sendWebRTCOffer: (targetUserId: string, offer: RTCSessionDescriptionInit, fileInfo: FileInfo) => void
    sendWebRTCAnswer: (targetUserId: string, answer: RTCSessionDescriptionInit) => void
    sendICECandidate: (targetUserId: string, candidate: RTCIceCandidateInit) => void
    sendWebRTCReject: (targetUserId: string, reason?: string) => void
  }
}

export function FileTransferProvider({ children, chatSocket }: FileTransferProviderProps) {
  const { conversations } = useChat()
  useAuth() // Ensure user is authenticated

  const [activeTransfers, setActiveTransfers] = useState<TransferProgress[]>([])
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([])
  const [incomingRequest, setIncomingRequest] = useState<IncomingTransferRequest | null>(null)

  // Create WebRTC service instance
  const webrtcServiceRef = useRef<WebRTCFileTransferService | null>(null)

  // Store files that this user has shared (for P2P download requests)
  const sharedFilesRef = useRef<Map<string, File>>(new Map())

  // Initialize WebRTC service
  useEffect(() => {
    const service = new WebRTCFileTransferService()

    // Set up signaling handler
    service.setSignalingHandler((event, data) => {
      const payload = data as Record<string, unknown>
      switch (event) {
        case 'webrtc-offer':
          chatSocket.sendWebRTCOffer(
            payload.targetUserId as string,
            payload.offer as RTCSessionDescriptionInit,
            payload.fileInfo as FileInfo
          )
          break
        case 'webrtc-answer':
          chatSocket.sendWebRTCAnswer(
            payload.targetUserId as string,
            payload.answer as RTCSessionDescriptionInit
          )
          break
        case 'webrtc-ice-candidate':
          chatSocket.sendICECandidate(
            payload.targetUserId as string,
            payload.candidate as RTCIceCandidateInit
          )
          break
        case 'webrtc-reject':
          chatSocket.sendWebRTCReject(
            payload.targetUserId as string,
            payload.reason as string
          )
          break
      }
    })

    // Listen to WebRTC service events
    service.on('transfer-progress', (progress) => {
      setActiveTransfers(prev => {
        const existing = prev.findIndex(t => t.transferId === progress.transferId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = progress
          return updated
        }
        return [...prev, progress]
      })

      // Remove completed/failed transfers after delay
      if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'rejected') {
        setTimeout(() => {
          setActiveTransfers(prev => prev.filter(t => t.transferId !== progress.transferId))
        }, 3000)
      }
    })

    service.on('transfer-complete', (transferId, blob, fileInfo) => {
      // Find the transfer to get peer info
      const transfer = webrtcServiceRef.current?.getActiveTransfers().find(t => t.transferId === transferId)
      
      setReceivedFiles(prev => [
        ...prev,
        {
          transferId,
          blob,
          fileInfo,
          fromUserId: transfer?.peerId ?? 'unknown',
          receivedAt: new Date(),
        },
      ])
    })

    service.on('transfer-error', (transferId, error) => {
      console.error(`[FileTransfer] Error in transfer ${transferId}:`, error)
    })

    webrtcServiceRef.current = service

    return () => {
      // Cleanup
      service.off('transfer-progress', () => {})
      service.off('transfer-complete', () => {})
      service.off('transfer-error', () => {})
    }
  }, [chatSocket])

  // Store pending offer for when user accepts
  const pendingOfferRef = useRef<{
    fromUserId: string
    offer: RTCSessionDescriptionInit
    fileInfo: FileInfo
  } | null>(null)

  // Listen for WebRTC signaling events from socket
  useEffect(() => {
    const handleOffer = (data: {
      fromUserId: string
      offer: RTCSessionDescriptionInit
      fileInfo: FileInfo
    }) => {
      console.log('[FileTransfer] Received WebRTC offer from:', data.fromUserId)

      // Store the offer for later acceptance
      pendingOfferRef.current = data

      // Find user name from conversations
      let fromUserName = 'Unknown User'
      for (const conv of conversations) {
        const participant = conv.participants.find(p => p.id === data.fromUserId)
        if (participant) {
          fromUserName = participant.name
          break
        }
      }

      // Show the incoming transfer modal
      setIncomingRequest({
        transferId: `pending-${Date.now()}`,
        fromUserId: data.fromUserId,
        fromUserName,
        fileInfo: data.fileInfo,
      })
    }

    const handleAnswer = (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('[FileTransfer] Received WebRTC answer from:', data.fromUserId)
      webrtcServiceRef.current?.handleAnswer(data.fromUserId, data.answer)
    }

    const handleIceCandidate = (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      webrtcServiceRef.current?.handleIceCandidate(data.fromUserId, data.candidate)
    }

    const handleRejected = (data: { fromUserId: string; reason: string }) => {
      console.log('[FileTransfer] Transfer rejected by:', data.fromUserId, data.reason)
      webrtcServiceRef.current?.handleRejection(data.fromUserId, data.reason)
    }

    chatSocket.on('webrtc-offer', handleOffer as (...args: unknown[]) => void)
    chatSocket.on('webrtc-answer', handleAnswer as (...args: unknown[]) => void)
    chatSocket.on('webrtc-ice-candidate', handleIceCandidate as (...args: unknown[]) => void)
    chatSocket.on('webrtc-rejected', handleRejected as (...args: unknown[]) => void)

    return () => {
      chatSocket.off('webrtc-offer', handleOffer as (...args: unknown[]) => void)
      chatSocket.off('webrtc-answer', handleAnswer as (...args: unknown[]) => void)
      chatSocket.off('webrtc-ice-candidate', handleIceCandidate as (...args: unknown[]) => void)
      chatSocket.off('webrtc-rejected', handleRejected as (...args: unknown[]) => void)
    }
  }, [chatSocket, conversations])

  // Actions
  const sendFile = useCallback(async (targetUserId: string, file: File): Promise<string> => {
    if (!webrtcServiceRef.current) {
      throw new Error('WebRTC service not initialized')
    }
    return webrtcServiceRef.current.sendFile(targetUserId, file)
  }, [])

  const acceptTransfer = useCallback(async (_transferId: string) => {
    // Process the pending offer now that user accepted
    const pendingOffer = pendingOfferRef.current
    if (pendingOffer && webrtcServiceRef.current) {
      console.log('[FileTransfer] User accepted transfer, processing offer...')
      await webrtcServiceRef.current.handleOffer(
        pendingOffer.fromUserId,
        pendingOffer.offer,
        pendingOffer.fileInfo
      )
      pendingOfferRef.current = null
    }
    setIncomingRequest(null)
  }, [])

  const rejectTransfer = useCallback((_transferId: string) => {
    // Reject the pending offer
    const pendingOffer = pendingOfferRef.current
    if (pendingOffer) {
      console.log('[FileTransfer] User rejected transfer')
      chatSocket.sendWebRTCReject(pendingOffer.fromUserId, 'Transfer rejected by user')
      pendingOfferRef.current = null
    }
    setIncomingRequest(null)
  }, [chatSocket])

  const cancelTransfer = useCallback((transferId: string) => {
    webrtcServiceRef.current?.cancelTransfer(transferId)
  }, [])

  const downloadFile = useCallback((transferId: string) => {
    const file = receivedFiles.find(f => f.transferId === transferId)
    if (!file) return

    // Create download link
    const url = URL.createObjectURL(file.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileInfo.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [receivedFiles])

  const clearReceivedFile = useCallback((transferId: string) => {
    setReceivedFiles(prev => prev.filter(f => f.transferId !== transferId))
  }, [])

  // Register a file for sharing (when user sends a file message)
  const registerFileForSharing = useCallback((file: File) => {
    const key = `${file.name}-${file.size}-${file.type}`
    sharedFilesRef.current.set(key, file)
    console.log(`[P2P] Registered file for sharing: ${key}`)
  }, [])

  // Request a file from a sender (when user clicks on a file message)
  const requestFile = useCallback(
    async (senderId: string, fileInfo: FileInfo) => {
      console.log(`[P2P] Requesting file from ${senderId}:`, fileInfo)

      // Send a file request to the sender via WebSocket
      // The sender will then initiate the WebRTC transfer
      chatSocket.sendFileRequest(senderId, fileInfo)
    },
    [chatSocket]
  )

  // Listen for file requests from other users (when someone wants to download our shared file)
  useEffect(() => {
    const handleFileRequest = (data: { fromUserId: string; fileInfo: FileInfo }) => {
      console.log('[P2P] Received file request from:', data.fromUserId, data.fileInfo)

      // Find the file in our shared files
      const key = `${data.fileInfo.name}-${data.fileInfo.size}-${data.fileInfo.type}`
      const file = sharedFilesRef.current.get(key)

      if (file && webrtcServiceRef.current) {
        console.log('[P2P] Found file, initiating P2P transfer to requester')
        // Initiate transfer to the requester (we are the sender)
        webrtcServiceRef.current.sendFile(data.fromUserId, file)
      } else {
        console.warn('[P2P] File not found or WebRTC not initialized. Available files:', 
          Array.from(sharedFilesRef.current.keys()))
        chatSocket.sendWebRTCReject(data.fromUserId, 'File not available - sender may be offline')
      }
    }

    // Listen for file-request events (not webrtc-offer)
    chatSocket.on('file-request', handleFileRequest as (...args: unknown[]) => void)

    return () => {
      chatSocket.off('file-request', handleFileRequest as (...args: unknown[]) => void)
    }
  }, [chatSocket])

  const value = useMemo(
    () => ({
      activeTransfers,
      receivedFiles,
      incomingRequest,
      sendFile,
      acceptTransfer,
      rejectTransfer,
      cancelTransfer,
      downloadFile,
      clearReceivedFile,
      registerFileForSharing,
      requestFile,
    }),
    [
      activeTransfers,
      receivedFiles,
      incomingRequest,
      sendFile,
      acceptTransfer,
      rejectTransfer,
      cancelTransfer,
      downloadFile,
      clearReceivedFile,
      registerFileForSharing,
      requestFile,
    ]
  )

  return <FileTransferContext.Provider value={value}>{children}</FileTransferContext.Provider>
}
