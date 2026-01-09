/**
 * WebRTC File Transfer Service
 * Handles P2P file transfers using WebRTC DataChannel
 */

export interface FileInfo {
  name: string
  size: number
  type: string
}

export interface TransferProgress {
  transferId: string
  fileName: string
  fileSize: number
  bytesTransferred: number
  progress: number // 0-100
  status: 'pending' | 'connecting' | 'transferring' | 'completed' | 'failed' | 'rejected'
  direction: 'upload' | 'download'
  peerId: string
  error?: string
}

export interface FileTransferEvents {
  'transfer-progress': (progress: TransferProgress) => void
  'transfer-complete': (transferId: string, file: Blob, fileInfo: FileInfo) => void
  'transfer-error': (transferId: string, error: string) => void
  'incoming-transfer': (transferId: string, fromUserId: string, fileInfo: FileInfo) => void
}

// Chunk size for file transfer (16KB is optimal for WebRTC DataChannel)
const CHUNK_SIZE = 16 * 1024

// Configuration for RTCPeerConnection
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
}

interface PeerConnection {
  pc: RTCPeerConnection
  dataChannel: RTCDataChannel | null
  transferId: string
  fileInfo: FileInfo
  direction: 'upload' | 'download'
  peerId: string
  chunks: ArrayBuffer[]
  bytesReceived: number
}

export class WebRTCFileTransferService {
  private connections: Map<string, PeerConnection> = new Map()
  private listeners: Map<keyof FileTransferEvents, Set<(...args: unknown[]) => void>> = new Map()
  private sendSignalingMessage: ((event: string, data: unknown) => void) | null = null

  constructor() {
    // Initialize listener maps
    ;(
      ['transfer-progress', 'transfer-complete', 'transfer-error', 'incoming-transfer'] as const
    ).forEach(event => {
      this.listeners.set(event, new Set())
    })
  }

  /**
   * Set the signaling message sender function
   * This will be called to send WebRTC signaling messages through the WebSocket
   */
  setSignalingHandler(handler: (event: string, data: unknown) => void): void {
    this.sendSignalingMessage = handler
  }

  /**
   * Subscribe to file transfer events
   */
  on<K extends keyof FileTransferEvents>(event: K, callback: FileTransferEvents[K]): void {
    this.listeners.get(event)?.add(callback as (...args: unknown[]) => void)
  }

  /**
   * Unsubscribe from file transfer events
   */
  off<K extends keyof FileTransferEvents>(event: K, callback: FileTransferEvents[K]): void {
    this.listeners.get(event)?.delete(callback as (...args: unknown[]) => void)
  }

  private emit<K extends keyof FileTransferEvents>(
    event: K,
    ...args: Parameters<FileTransferEvents[K]>
  ): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in ${event} listener:`, error)
      }
    })
  }

  private generateTransferId(): string {
    return `transfer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Initiate a file transfer to a peer
   */
  async sendFile(targetUserId: string, file: File): Promise<string> {
    const transferId = this.generateTransferId()
    const fileInfo: FileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
    }

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection(RTC_CONFIG)

    // Create DataChannel for file transfer
    const dataChannel = pc.createDataChannel('fileTransfer', {
      ordered: true,
    })

    const connection: PeerConnection = {
      pc,
      dataChannel,
      transferId,
      fileInfo,
      direction: 'upload',
      peerId: targetUserId,
      chunks: [],
      bytesReceived: 0,
    }

    this.connections.set(transferId, connection)

    // Emit initial progress
    this.emitProgress(transferId, 'connecting', 0)

    // Handle ICE candidates
    pc.onicecandidate = event => {
      if (event.candidate && this.sendSignalingMessage) {
        this.sendSignalingMessage('webrtc-ice-candidate', {
          targetUserId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${pc.connectionState}`)
      if (pc.connectionState === 'failed') {
        this.handleTransferError(transferId, 'Connection failed')
      }
    }

    // Setup data channel handlers
    dataChannel.onopen = async () => {
      console.log('[WebRTC] DataChannel opened, starting file transfer')
      this.emitProgress(transferId, 'transferring', 0)
      await this.sendFileChunks(transferId, file)
    }

    dataChannel.onerror = event => {
      console.error('[WebRTC] DataChannel error:', event)
      this.handleTransferError(transferId, 'DataChannel error')
    }

    // Create and send offer
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      if (this.sendSignalingMessage) {
        this.sendSignalingMessage('webrtc-offer', {
          targetUserId,
          offer: pc.localDescription,
          fileInfo,
        })
      }
    } catch (error) {
      this.handleTransferError(transferId, `Failed to create offer: ${error}`)
    }

    return transferId
  }

  /**
   * Handle incoming WebRTC offer (receiver side)
   */
  async handleOffer(
    fromUserId: string,
    offer: RTCSessionDescriptionInit,
    fileInfo: FileInfo
  ): Promise<string> {
    const transferId = this.generateTransferId()

    // Emit incoming transfer event for UI to show accept/reject dialog
    this.emit('incoming-transfer', transferId, fromUserId, fileInfo)

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection(RTC_CONFIG)

    const connection: PeerConnection = {
      pc,
      dataChannel: null,
      transferId,
      fileInfo,
      direction: 'download',
      peerId: fromUserId,
      chunks: [],
      bytesReceived: 0,
    }

    this.connections.set(transferId, connection)

    // Handle ICE candidates
    pc.onicecandidate = event => {
      if (event.candidate && this.sendSignalingMessage) {
        this.sendSignalingMessage('webrtc-ice-candidate', {
          targetUserId: fromUserId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    // Handle incoming data channel
    pc.ondatachannel = event => {
      const dataChannel = event.channel
      connection.dataChannel = dataChannel

      dataChannel.onopen = () => {
        console.log('[WebRTC] DataChannel opened for receiving')
        this.emitProgress(transferId, 'transferring', 0)
      }

      dataChannel.onmessage = event => {
        this.handleIncomingChunk(transferId, event.data)
      }

      dataChannel.onerror = event => {
        console.error('[WebRTC] DataChannel error:', event)
        this.handleTransferError(transferId, 'DataChannel error')
      }
    }

    // Set remote description and create answer
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      if (this.sendSignalingMessage) {
        this.sendSignalingMessage('webrtc-answer', {
          targetUserId: fromUserId,
          answer: pc.localDescription,
        })
      }

      this.emitProgress(transferId, 'connecting', 0)
    } catch (error) {
      this.handleTransferError(transferId, `Failed to handle offer: ${error}`)
    }

    return transferId
  }

  /**
   * Handle incoming WebRTC answer (sender side)
   */
  async handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    // Find the connection for this peer
    const connection = this.findConnectionByPeer(fromUserId, 'upload')
    if (!connection) {
      console.warn('[WebRTC] No connection found for answer from:', fromUserId)
      return
    }

    try {
      await connection.pc.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('[WebRTC] Remote description set successfully')
    } catch (error) {
      this.handleTransferError(connection.transferId, `Failed to set remote description: ${error}`)
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(fromUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    // Find connection by peer ID
    const connection = this.findConnectionByPeer(fromUserId)
    if (!connection) {
      console.warn('[WebRTC] No connection found for ICE candidate from:', fromUserId)
      return
    }

    try {
      await connection.pc.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('[WebRTC] Failed to add ICE candidate:', error)
    }
  }

  /**
   * Reject an incoming transfer
   */
  rejectTransfer(transferId: string): void {
    const connection = this.connections.get(transferId)
    if (!connection) return

    if (this.sendSignalingMessage) {
      this.sendSignalingMessage('webrtc-reject', {
        targetUserId: connection.peerId,
        reason: 'Transfer rejected by user',
      })
    }

    this.cleanup(transferId)
    this.emitProgress(transferId, 'rejected', 0)
  }

  /**
   * Handle transfer rejection
   */
  handleRejection(fromUserId: string, reason: string): void {
    const connection = this.findConnectionByPeer(fromUserId, 'upload')
    if (connection) {
      this.emitProgress(connection.transferId, 'rejected', 0)
      this.emit('transfer-error', connection.transferId, reason)
      this.cleanup(connection.transferId)
    }
  }

  private findConnectionByPeer(
    peerId: string,
    direction?: 'upload' | 'download'
  ): PeerConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.peerId === peerId) {
        if (!direction || connection.direction === direction) {
          return connection
        }
      }
    }
    return undefined
  }

  private async sendFileChunks(transferId: string, file: File): Promise<void> {
    const connection = this.connections.get(transferId)
    if (!connection?.dataChannel) return

    const dataChannel = connection.dataChannel
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let chunkIndex = 0

    // Send file metadata first
    dataChannel.send(
      JSON.stringify({
        type: 'metadata',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        totalChunks,
      })
    )

    const reader = new FileReader()
    let offset = 0

    const readNextChunk = (): void => {
      const slice = file.slice(offset, offset + CHUNK_SIZE)
      reader.readAsArrayBuffer(slice)
    }

    reader.onload = (e): void => {
      if (!e.target?.result) return

      const chunk = e.target.result as ArrayBuffer

      // Wait for buffer to be available
      const sendChunk = (): void => {
        if (dataChannel.bufferedAmount > CHUNK_SIZE * 10) {
          setTimeout(sendChunk, 50)
          return
        }

        dataChannel.send(chunk)
        chunkIndex++
        offset += chunk.byteLength

        const progress = Math.round((offset / file.size) * 100)
        this.emitProgress(transferId, 'transferring', progress, offset)

        if (offset < file.size) {
          readNextChunk()
        } else {
          // Send completion message
          dataChannel.send(JSON.stringify({ type: 'complete' }))
          this.emitProgress(transferId, 'completed', 100, file.size)

          // Cleanup after a short delay
          setTimeout(() => this.cleanup(transferId), 1000)
        }
      }

      sendChunk()
    }

    reader.onerror = (): void => {
      this.handleTransferError(transferId, 'Failed to read file')
    }

    readNextChunk()
  }

  private handleIncomingChunk(transferId: string, data: ArrayBuffer | string): void {
    const connection = this.connections.get(transferId)
    if (!connection) return

    // Check if it's a control message (string)
    if (typeof data === 'string') {
      try {
        const message = JSON.parse(data)
        if (message.type === 'metadata') {
          connection.fileInfo = {
            name: message.name,
            size: message.size,
            type: message.mimeType,
          }
          console.log('[WebRTC] Received file metadata:', connection.fileInfo)
        } else if (message.type === 'complete') {
          // File transfer complete
          const blob = new Blob(connection.chunks, { type: connection.fileInfo.type })
          this.emit('transfer-complete', transferId, blob, connection.fileInfo)
          this.emitProgress(transferId, 'completed', 100, connection.fileInfo.size)

          // Cleanup after a short delay
          setTimeout(() => this.cleanup(transferId), 1000)
        }
      } catch {
        console.warn('[WebRTC] Failed to parse control message')
      }
      return
    }

    // It's a chunk of file data
    connection.chunks.push(data)
    connection.bytesReceived += data.byteLength

    const progress = Math.round((connection.bytesReceived / connection.fileInfo.size) * 100)
    this.emitProgress(transferId, 'transferring', progress, connection.bytesReceived)
  }

  private emitProgress(
    transferId: string,
    status: TransferProgress['status'],
    progress: number,
    bytesTransferred = 0
  ): void {
    const connection = this.connections.get(transferId)
    if (!connection) return

    const progressData: TransferProgress = {
      transferId,
      fileName: connection.fileInfo.name,
      fileSize: connection.fileInfo.size,
      bytesTransferred,
      progress,
      status,
      direction: connection.direction,
      peerId: connection.peerId,
    }

    this.emit('transfer-progress', progressData)
  }

  private handleTransferError(transferId: string, error: string): void {
    console.error(`[WebRTC] Transfer error (${transferId}):`, error)

    const connection = this.connections.get(transferId)
    if (connection) {
      this.emitProgress(transferId, 'failed', 0)
      this.emit('transfer-error', transferId, error)
    }

    this.cleanup(transferId)
  }

  private cleanup(transferId: string): void {
    const connection = this.connections.get(transferId)
    if (!connection) return

    if (connection.dataChannel) {
      connection.dataChannel.close()
    }
    connection.pc.close()
    connection.chunks = []

    this.connections.delete(transferId)
  }

  /**
   * Get all active transfers
   */
  getActiveTransfers(): TransferProgress[] {
    const transfers: TransferProgress[] = []
    for (const connection of this.connections.values()) {
      transfers.push({
        transferId: connection.transferId,
        fileName: connection.fileInfo.name,
        fileSize: connection.fileInfo.size,
        bytesTransferred: connection.bytesReceived,
        progress: Math.round((connection.bytesReceived / connection.fileInfo.size) * 100),
        status: 'transferring',
        direction: connection.direction,
        peerId: connection.peerId,
      })
    }
    return transfers
  }

  /**
   * Cancel a transfer
   */
  cancelTransfer(transferId: string): void {
    this.cleanup(transferId)
    this.emitProgress(transferId, 'failed', 0)
    this.emit('transfer-error', transferId, 'Transfer cancelled')
  }
}
