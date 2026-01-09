import { api } from '@/lib/api'

export interface UploadResponse {
  url: string
  publicId: string
  originalName: string
  format: string
  bytes: number
  mimeType: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export async function uploadChatFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{ data: UploadResponse }>('/upload/chat-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progressEvent => {
      if (onProgress && progressEvent.total) {
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        })
      }
    },
  })

  return response.data.data
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  return '📎'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
