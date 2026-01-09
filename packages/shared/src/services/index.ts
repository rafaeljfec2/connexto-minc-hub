export * from './api-client'
export * from './api-services'
export * from './auth-service'
export * from './api/chat-api.service'
export * from './websocket/chat-socket.service'
export { WebRTCFileTransferService } from './webrtc/webrtc-file-transfer.service'
export type { TransferProgress, FileTransferEvents } from './webrtc/webrtc-file-transfer.service'
// Note: FileInfo is exported from both websocket and webrtc services
// Use the websocket one as canonical, or import directly from webrtc if needed
