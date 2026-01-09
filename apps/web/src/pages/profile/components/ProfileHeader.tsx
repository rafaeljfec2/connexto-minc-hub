import { useRef } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import type { User } from '@minc-hub/shared/types'

interface ProfileHeaderProps {
  readonly user: User
  readonly onAvatarChange: (file: File) => void
  readonly isUploading?: boolean
  readonly error?: string | null
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ProfileHeader({
  user,
  onAvatarChange,
  isUploading = false,
  error,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Por favor, selecione uma imagem válida (JPG, PNG ou WebP)')
      return
    }

    // Validate file size (max 5MB - same as backend)
    if (file.size > MAX_FILE_SIZE) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    onAvatarChange(file)

    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-800 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative group">
          <div className="relative">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="xl"
              className="ring-4 ring-white dark:ring-dark-900"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-dark-900"
            aria-label="Alterar foto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-dark-50">
            {user.name}
          </h2>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {user.role}
            </span>
            <span className="text-sm text-dark-500 dark:text-dark-400">
              Membro desde Janeiro 2024
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
