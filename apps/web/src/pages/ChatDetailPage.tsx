import { useParams, useNavigate } from 'react-router-dom'
import { ChatWindow } from './chat/components/ChatWindow'
import { ChatLayout } from './chat/components/ChatLayout'

export default function ChatDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()

  if (!conversationId) return null

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden h-full">
        <ChatWindow conversationId={conversationId} onBack={() => navigate('/chat')} />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block h-full">
        <ChatLayout>
          <ChatWindow conversationId={conversationId} />
        </ChatLayout>
      </div>
    </>
  )
}
