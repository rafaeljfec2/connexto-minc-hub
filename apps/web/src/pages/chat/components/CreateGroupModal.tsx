import { useState, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (name: string, memberIds: string[]) => Promise<void>
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { users, isLoading } = useUsers()
  const { user: currentUser } = useAuth()
  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users
      .filter(u => u.id !== currentUser?.id)
      .filter(
        u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [users, currentUser, searchQuery])

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return

    setIsSubmitting(true)
    try {
      await onCreateGroup(groupName, selectedUserIds)
      onClose()
      // Reset state
      setGroupName('')
      setSelectedUserIds([])
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to create group', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Grupo" size="md">
      <div className="flex flex-col h-[70vh] sm:h-[600px] -mx-6 px-6">
        {/* Group Name Input */}
        <div className="mb-4 mt-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Nome do Grupo
          </label>
          <input
            type="text"
            className="block w-full px-3 py-2 border border-dark-200 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-800 placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-dark-900 dark:text-dark-50 transition-colors"
            placeholder="Ex: Louvor Domingo"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Selecionar Membros
          </label>
          <div className="relative">
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
            />
          </div>
        </div>

        {/* Selected Count */}
        <div className="mb-2 text-sm text-dark-500 dark:text-dark-400 flex justify-between items-center">
          <span>
            {selectedUserIds.length}{' '}
            {selectedUserIds.length === 1 ? 'membro selecionado' : 'membros selecionados'}
          </span>
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => setSelectedUserIds([])}
              className="text-primary-500 hover:text-primary-600 text-xs font-medium"
            >
              Limpar seleção
            </button>
          )}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4 border-t border-dark-100 dark:border-dark-800">
          {(() => {
            if (isLoading) {
              return (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              )
            }

            if (filteredUsers.length === 0) {
              return (
                <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                  {searchQuery ? 'Nenhum usuário encontrado.' : 'Nenhum usuário disponível.'}
                </div>
              )
            }

            return (
              <div className="divide-y divide-dark-100 dark:divide-dark-800">
                {filteredUsers.map(user => {
                  const isSelected = selectedUserIds.includes(user.id)
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`w-full flex items-center gap-3 p-3 transition-colors rounded-lg text-left group ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/10'
                          : 'hover:bg-dark-50 dark:hover:bg-dark-800/50'
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-dark-300 dark:border-dark-600'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })()}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={groupName.trim() === '' || selectedUserIds.length === 0 || isSubmitting}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando...
              </>
            ) : (
              'Criar Grupo'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
