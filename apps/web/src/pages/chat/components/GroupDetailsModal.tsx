import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { UserPlus, LogOut } from 'lucide-react'
import { Conversation } from '@minc-hub/shared/types'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { UserSelectionModal } from './UserSelectionModal'

interface GroupDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation
}

export function GroupDetailsModal({ isOpen, onClose, conversation }: GroupDetailsModalProps) {
  const { user: currentUser } = useAuth()
  const { leaveConversation, addParticipant, promoteToAdmin } = useChat()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isGroup = conversation.type === 'group'
  const otherParticipant = !isGroup
    ? conversation.participants.find(p => p.id !== currentUser?.id)
    : null

  const isAdmin =
    isGroup && conversation.participants.find(p => p.id === currentUser?.id)?.role === 'admin'

  const modalTitle = isGroup ? 'Dados do Grupo' : 'Dados da Conversa'
  const displayName = isGroup ? conversation.name || 'Grupo' : otherParticipant?.name || 'Usuário'
  const displayAvatar = isGroup ? undefined : otherParticipant?.avatar

  const handleLeaveGroup = async () => {
    if (!confirm('Tem certeza que deseja sair do grupo?')) return

    setIsLoading(true)
    try {
      await leaveConversation(conversation.id)
      onClose()
    } catch (error) {
      console.error('Failed to leave group:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async (userId: string) => {
    setIsLoading(true)
    try {
      await addParticipant(conversation.id, userId)
      setIsAddMemberOpen(false)
    } catch (error) {
      console.error('Failed to add member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    setIsLoading(true)
    try {
      await promoteToAdmin(conversation.id, userId)
    } catch (error) {
      console.error('Failed to promote member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md">
        <div className="space-y-6">
          {/* Header / Info */}
          <div className="flex flex-col items-center justify-center p-4 bg-dark-50 dark:bg-dark-900 rounded-xl">
            <Avatar
              src={displayAvatar}
              name={displayName}
              isOnline={!isGroup && otherParticipant?.isOnline}
              size="xl"
              className="mb-3"
            />
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 text-center">
              {displayName}
            </h3>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              {isGroup
                ? `${conversation.participants.length} participantes`
                : otherParticipant?.isOnline
                  ? 'Online'
                  : 'Offline'}
            </p>
          </div>

          {/* Actions - Only for groups and admins */}
          {isGroup && isAdmin && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Participante
              </Button>
            </div>
          )}

          {/* Members List */}
          <div>
            <h4 className="text-sm font-medium text-dark-600 dark:text-dark-300 mb-3 px-1">
              Participantes
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {conversation.participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={participant.avatar}
                      name={participant.name}
                      isOnline={participant.isOnline}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                        {participant.name}
                        {participant.id === currentUser?.id && ' (Você)'}
                      </p>
                      <p className="text-xs text-dark-500">{participant.role || 'Membro'}</p>
                    </div>
                  </div>

                  {isGroup && isAdmin && participant.role !== 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePromoteToAdmin(participant.id)}
                      disabled={isLoading}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Promover
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions - Only for groups */}
          {isGroup && (
            <div className="pt-4 border-t border-dark-100 dark:border-dark-800">
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-2"
                onClick={handleLeaveGroup}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4" />
                Sair do Grupo
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <UserSelectionModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSelectUser={handleAddMember}
      />
    </>
  )
}
