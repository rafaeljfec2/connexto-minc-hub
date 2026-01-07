import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@minc-hub/shared/types'

interface UserSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (userId: string) => void
}

export function UserSelectionModal({ isOpen, onClose, onSelectUser }: UserSelectionModalProps) {
  const { users, isLoading } = useUsers()
  const { user: currentUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users
      .filter(u => u.id !== currentUser?.id) // Filter out current user
      .filter(
        u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [users, currentUser, searchQuery])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Conversa" size="md">
      <div className="flex flex-col h-[60vh] sm:h-[500px]">
        {/* Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-dark-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-dark-200 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-800 placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-dark-900 dark:text-dark-50 transition-colors"
            placeholder="Buscar pessoas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-dark-500 dark:text-dark-400">
              {searchQuery ? 'Nenhum usuário encontrado.' : 'Nenhum usuário disponível.'}
            </div>
          ) : (
            <div className="divide-y divide-dark-100 dark:divide-dark-800">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors rounded-lg text-left group"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold group-hover:scale-105 transition-transform">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
