import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ComboBox } from '@/components/ui/ComboBox'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { Checkbox } from '@/components/ui/Checkbox'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/layout/PageHeader'
import { useModal } from '@/hooks/useModal'
import { Team, Person } from '@/types'

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Equipe Manhã',
    ministryId: '1',
    memberIds: ['1', '2'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Equipe Noite',
    ministryId: '1',
    memberIds: ['3'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface Message {
  id: string
  title: string
  content: string
  recipients: {
    type: 'all' | 'team' | 'person'
    ids: string[]
  }
  attachment?: {
    name: string
    url: string
  }
  communicationTypes: ('email' | 'chat')[]
  sentAt: string
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    title: 'Lembrete: Culto de domingo',
    content: 'Não esqueçam do culto de domingo às 9h. Cheguem 30 minutos antes.',
    recipients: { type: 'all', ids: [] },
    communicationTypes: ['email', 'chat'],
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Reunião de equipe',
    content: 'Reunião da equipe na quarta-feira às 19h.',
    recipients: { type: 'team', ids: ['1'] },
    communicationTypes: ['chat'],
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function CommunicationPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const modal = useModal()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipientType: 'all' as 'all' | 'team' | 'person',
    selectedIds: [] as string[],
    attachment: null as File | null,
    sendViaEmail: false,
    sendViaChat: false,
  })

  function handleOpenModal() {
    setFormData({
      title: '',
      content: '',
      recipientType: 'all',
      selectedIds: [],
      attachment: null,
      sendViaEmail: false,
      sendViaChat: false,
    })
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setFormData({
      title: '',
      content: '',
      recipientType: 'all',
      selectedIds: [],
      attachment: null,
      sendViaEmail: false,
      sendViaChat: false,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate at least one communication type is selected
    if (!formData.sendViaEmail && !formData.sendViaChat) {
      alert('Selecione pelo menos um tipo de comunicação (Email ou Chat)')
      return
    }

    const communicationTypes: ('email' | 'chat')[] = []
    if (formData.sendViaEmail) communicationTypes.push('email')
    if (formData.sendViaChat) communicationTypes.push('chat')

    const newMessage: Message = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      recipients: {
        type: formData.recipientType,
        ids: formData.selectedIds,
      },
      attachment: formData.attachment
        ? {
            name: formData.attachment.name,
            url: URL.createObjectURL(formData.attachment),
          }
        : undefined,
      communicationTypes,
      sentAt: new Date().toISOString(),
    }

    setMessages([newMessage, ...messages])
    handleCloseModal()
  }

  function toggleSelection(id: string) {
    setFormData({
      ...formData,
      selectedIds: formData.selectedIds.includes(id)
        ? formData.selectedIds.filter(selectedId => selectedId !== id)
        : [...formData.selectedIds, id],
    })
  }

  function getRecipientLabel(message: Message) {
    if (message.recipients.type === 'all') {
      return 'Todos os membros'
    }
    if (message.recipients.type === 'team') {
      const teamNames = message.recipients.ids
        .map(id => MOCK_TEAMS.find(t => t.id === id)?.name)
        .filter(Boolean)
      return `Equipe${teamNames.length > 1 ? 's' : ''}: ${teamNames.join(', ')}`
    }
    const personNames = message.recipients.ids
      .map(id => MOCK_PEOPLE.find(p => p.id === id)?.name)
      .filter(Boolean)
    return `Servo${personNames.length > 1 ? 's' : ''}: ${personNames.join(', ')}`
  }

  const checkboxItems =
    formData.recipientType === 'team'
      ? MOCK_TEAMS.filter(t => t.isActive).map(team => ({
          id: team.id,
          label: team.name,
        }))
      : MOCK_PEOPLE.map(person => ({
          id: person.id,
          label: person.name,
        }))

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6 sm:pb-8 lg:py-8">
      <PageHeader
        title="Comunicação"
        description="Envie mensagens para membros e equipes"
        action={
          <Button variant="primary" size="md" onClick={handleOpenModal}>
            Nova Mensagem
          </Button>
        }
      />

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-dark-400">
              <p className="mb-2">Nenhuma mensagem enviada</p>
              <p className="text-sm">Clique em "Nova Mensagem" para começar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {messages.map(message => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{message.title}</CardTitle>
                    <p className="text-xs text-dark-400 mt-1">{getRecipientLabel(message)}</p>
                    {/* Communication Type Badges */}
                    <div className="flex gap-2 mt-2">
                      {message.communicationTypes.includes('email') && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          📧 Email
                        </span>
                      )}
                      {message.communicationTypes.includes('chat') && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          💬 Chat
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-dark-500">
                    {new Date(message.sentAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dark-300 whitespace-pre-wrap">{message.content}</p>
                {/* Attachment Display */}
                {message.attachment && (
                  <div className="mt-3 pt-3 border-t border-dark-100 dark:border-dark-800">
                    <a
                      href={message.attachment.url}
                      download={message.attachment.name}
                      className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      📎 {message.attachment.name}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modal.isOpen} onClose={handleCloseModal} title="Nova Mensagem" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título *"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Mensagem *"
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="Digite sua mensagem..."
            rows={6}
            required
          />

          {/* Attachment Upload */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Anexo (opcional)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.txt,.doc,.docx"
              onChange={e =>
                setFormData({
                  ...formData,
                  attachment: e.target.files?.[0] || null,
                })
              }
              className="block w-full text-sm text-dark-900 dark:text-dark-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400 dark:hover:file:bg-primary-900/30"
            />
            <p className="text-xs text-dark-500 mt-1">
              Formatos aceitos: PDF, Imagens (JPG, PNG, GIF), Vídeos (MP4, MOV, AVI), Documentos
              (TXT, DOC, DOCX)
            </p>
            {formData.attachment && (
              <p className="text-xs text-dark-600 dark:text-dark-400 mt-1 font-medium">
                Arquivo selecionado: {formData.attachment.name}
              </p>
            )}
          </div>

          <ComboBox
            label="Destinatários *"
            value={formData.recipientType}
            onValueChange={value =>
              setFormData({
                ...formData,
                recipientType: (value as 'all' | 'team' | 'person') || 'all',
                selectedIds: [],
              })
            }
            options={[
              { value: 'all', label: 'Todos os membros' },
              { value: 'team', label: 'Grupos/Equipes específicas' },
              { value: 'person', label: 'Servos específicos' },
            ]}
            searchable
            searchPlaceholder="Buscar..."
          />
          {formData.recipientType !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Selecionar {formData.recipientType === 'team' ? 'Grupos/Equipes' : 'Servos'}
              </label>
              <CheckboxList
                items={checkboxItems}
                selectedIds={formData.selectedIds}
                onToggle={toggleSelection}
              />
            </div>
          )}

          {/* Communication Type Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Tipo de Comunicação *
            </label>
            <div className="space-y-2">
              <Checkbox
                label="Enviar por Email"
                checked={formData.sendViaEmail}
                onChange={e => setFormData({ ...formData, sendViaEmail: e.target.checked })}
              />
              <Checkbox
                label="Enviar por Chat (Grupo)"
                checked={formData.sendViaChat}
                onChange={e => setFormData({ ...formData, sendViaChat: e.target.checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Enviar Mensagem
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
