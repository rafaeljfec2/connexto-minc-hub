export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_FOLDER: 'chat-attachments',
} as const;

export const AVATAR_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  FOLDER: 'avatars',
  WIDTH: 256,
  HEIGHT: 256,
} as const;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
] as const;

export const AVATAR_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
export type AvatarAllowedMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];
