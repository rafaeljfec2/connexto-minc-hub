import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { UserSelectionModal } from './UserSelectionModal'
import { CreateGroupModal } from './CreateGroupModal'
import { ChatListHeader } from './ChatListHeader'
import { ChatListSearch } from './ChatListSearch'
import { ChatListContent } from './ChatListContent'
import { ChatListDropdown } from './ChatListDropdown'

interface ChatListProps {
  className?: string
  onConversationClick?: () => void
}

export function ChatList({ className, onConversationClick }: Readonly<ChatListProps>) {
  const navigate = useNavigate()
  const {
    conversations,
    isLoadingConversations,
    startConversation,
    createGroup,
    createGroupFromTeam,
  } = useChat()
  const { user } = useAuth()
  const { showError } = useToast()

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations

    const term = searchTerm.toLowerCase()
    return conversations.filter(conversation => {
      const otherParticipant = conversation.participants.find(p => p.id !== user?.id)
      if (!otherParticipant) return false

      // Search by participant name
      if (otherParticipant.name?.toLowerCase().includes(term)) return true

      // Search by last message text
      if (conversation.lastMessage?.text.toLowerCase().includes(term)) return true

      return false
    })
  }, [conversations, searchTerm, user?.id])

  const handleConversationPress = (conversationId: string, otherUserId: string) => {
    navigate(`/chat/${conversationId}`, { state: { otherUserId } })
    onConversationClick?.()
  }

  const handleSelectUser = async (userId: string) => {
    try {
      const existingConversation = conversations.find(c =>
        c.participants.some(p => p.id === userId)
      )

      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`, { state: { otherUserId: userId } })
      } else {
        const newConversation = await startConversation(userId)
        navigate(`/chat/${newConversation.id}`, { state: { otherUserId: userId } })
      }
      setIsNewChatModalOpen(false)
      onConversationClick?.()
    } catch (error) {
      console.error('Failed to start conversation', error)
      showError('Falha ao iniciar conversa. Tente novamente.')
    }
  }

  const handleCreateGroup = async (name: string, selectedUserIds: string[]) => {
    try {
      const newGroup = await createGroup(name, selectedUserIds)
      navigate(`/chat/${newGroup.id}`)
      onConversationClick?.()
      setIsGroupChatModalOpen(false)
    } catch (error) {
      console.error('Failed to create group', error)
      showError('Falha ao criar grupo.')
    }
  }

  const handleCreateGroupFromTeam = async (teamId: string, customName?: string) => {
    try {
      const newGroup = await createGroupFromTeam(teamId, customName)
      navigate(`/chat/${newGroup.id}`)
      onConversationClick?.()
      setIsGroupChatModalOpen(false)
    } catch (error) {
      console.error('Failed to create group from team', error)
      showError('Falha ao criar grupo a partir da equipe.')
    }
  }

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-dark-950 border-r border-dark-200 dark:border-dark-800 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+5rem)] lg:pb-0 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-200 dark:border-dark-800">
        <div className="relative">
          <ChatListHeader onNewConversationClick={() => setIsDropdownOpen(!isDropdownOpen)} />
          <ChatListDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onNewChat={() => setIsNewChatModalOpen(true)}
            onNewGroupChat={() => setIsGroupChatModalOpen(true)}
          />
        </div>
        <ChatListSearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <ChatListContent
          conversations={filteredConversations}
          isLoading={isLoadingConversations}
          currentUserId={user?.id}
          onConversationPress={handleConversationPress}
          onNewChat={() => setIsNewChatModalOpen(true)}
        />
      </div>

      <UserSelectionModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={handleSelectUser}
      />

      <CreateGroupModal
        isOpen={isGroupChatModalOpen}
        onClose={() => setIsGroupChatModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        onCreateGroupFromTeam={handleCreateGroupFromTeam}
      />
    </div>
  )
}
