import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { CheckboxList } from '@/components/ui/CheckboxList'
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
  sentAt: string
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    title: 'Lembrete: Culto de domingo',
    content: 'Não esqueçam do culto de domingo às 9h. Cheguem 30 minutos antes.',
    recipients: { type: 'all', ids: [] },
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Reunião de equipe',
    content: 'Reunião da equipe na quarta-feira às 19h.',
    recipients: { type: 'team', ids: ['1'] },
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
  })

  function handleOpenModal() {
    setFormData({
      title: '',
      content: '',
      recipientType: 'all',
      selectedIds: [],
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
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newMessage: Message = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      recipients: {
        type: formData.recipientType,
        ids: formData.selectedIds,
      },
      sentAt: new Date().toISOString(),
    }

    setMessages([newMessage, ...messages])
    handleCloseModal()
  }

  function toggleSelection(id: string) {
    setFormData({
      ...formData,
      selectedIds: formData.selectedIds.includes(id)
        ? formData.selectedIds.filter((selectedId) => selectedId !== id)
        : [...formData.selectedIds, id],
    })
  }

  function getRecipientLabel(message: Message) {
    if (message.recipients.type === 'all') {
      return 'Todos os membros'
    }
    if (message.recipients.type === 'team') {
      const teamNames = message.recipients.ids
        .map((id) => MOCK_TEAMS.find((t) => t.id === id)?.name)
        .filter(Boolean)
      return `Equipe${teamNames.length > 1 ? 's' : ''}: ${teamNames.join(', ')}`
    }
    const personNames = message.recipients.ids
      .map((id) => MOCK_PEOPLE.find((p) => p.id === id)?.name)
      .filter(Boolean)
    return `Pessoa${personNames.length > 1 ? 's' : ''}: ${personNames.join(', ')}`
  }

  const checkboxItems =
    formData.recipientType === 'team'
      ? MOCK_TEAMS.filter((t) => t.isActive).map((team) => ({
          id: team.id,
          label: team.name,
        }))
      : MOCK_PEOPLE.map((person) => ({
          id: person.id,
          label: person.name,
        }))

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <p className="text-sm">
                Clique em "Nova Mensagem" para começar
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{message.title}</CardTitle>
                    <p className="text-xs text-dark-400 mt-1">
                      {getRecipientLabel(message)}
                    </p>
                  </div>
                  <span className="text-xs text-dark-500">
                    {new Date(message.sentAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dark-300 whitespace-pre-wrap">
                  {message.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title="Nova Mensagem"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título *"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Textarea
            label="Mensagem *"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Digite sua mensagem..."
            rows={6}
            required
          />
          <Select
            label="Destinatários *"
            value={formData.recipientType}
            onChange={(e) =>
              setFormData({
                ...formData,
                recipientType: e.target.value as 'all' | 'team' | 'person',
                selectedIds: [],
              })
            }
            options={[
              { value: 'all', label: 'Todos os membros' },
              { value: 'team', label: 'Equipe específica' },
              { value: 'person', label: 'Pessoa específica' },
            ]}
          />
          {formData.recipientType !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Selecionar {formData.recipientType === 'team' ? 'Equipes' : 'Pessoas'}
              </label>
              <CheckboxList
                items={checkboxItems}
                selectedIds={formData.selectedIds}
                onToggle={toggleSelection}
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
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
