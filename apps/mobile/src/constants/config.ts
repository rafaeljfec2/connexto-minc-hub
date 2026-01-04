export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001',
  MOCK_MODE: process.env.EXPO_PUBLIC_MOCK_MODE === 'true' || !process.env.EXPO_PUBLIC_API_URL,
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
} as const
