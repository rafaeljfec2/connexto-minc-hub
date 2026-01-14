import { api } from '@/lib/api'

interface ApiResponse<T> {
  statusCode: number
  route: string
  data: T
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await api.post<ApiResponse<ChangePasswordResponse>>(
    '/auth/change-password',
    data
  )
  return response.data.data
}
