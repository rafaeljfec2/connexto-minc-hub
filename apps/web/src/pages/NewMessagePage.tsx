import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ComboBox } from '@/components/ui/ComboBox'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { Checkbox } from '@/components/ui/Checkbox'
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

export default function NewMessagePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipientType: 'all' as 'all' | 'team' | 'person',
    selectedIds: [] as string[],
    attachment: null as File | null,
    sendViaEmail: false,
    sendViaChat: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate at least one communication type is selected
    if (!formData.sendViaEmail && !formData.sendViaChat) {
      alert('Selecione pelo menos um tipo de comunicação (Email ou Chat)')
      return
    }

    // Navigate back to communication page
    navigate('/communication')
  }

  function toggleSelection(id: string) {
    setFormData({
      ...formData,
      selectedIds: formData.selectedIds.includes(id)
        ? formData.selectedIds.filter(selectedId => selectedId !== id)
        : [...formData.selectedIds, id],
    })
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
    <div className="flex flex-col min-h-screen bg-transparent dark:bg-dark-950">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 z-30 w-full border-b border-dark-200 bg-white dark:border-dark-800 dark:bg-dark-950 safe-area-top pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-2 py-2 gap-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-50">Nova Mensagem</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top)+56px)] pb-20">
        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Digite o título"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1"
            >
              Mensagem <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
              placeholder="Digite sua mensagem..."
              rows={6}
            />
          </div>

          {/* Attachment */}
          <div>
            <label
              htmlFor="attachment"
              className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1"
            >
              Anexo (opcional)
            </label>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors text-sm font-medium">
                <input
                  type="file"
                  className="hidden"
                  onChange={e =>
                    setFormData({ ...formData, attachment: e.target.files?.[0] || null })
                  }
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.txt"
                  id="attachment"
                />
                Escolher arquivo
              </label>
              {formData.attachment && (
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  {formData.attachment.name}
                </p>
              )}
              <p className="text-xs text-dark-500 dark:text-dark-400">
                Formatos aceitos: PDF, Imagens (JPG, PNG, GIF), Vídeos (MP4, MOV, AVI), Documentos
                (TXT, DOC, DOCX)
              </p>
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label
              htmlFor="recipientType"
              className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1"
            >
              Destinatários <span className="text-red-500">*</span>
            </label>
            <ComboBox
              options={[
                { value: 'all', label: 'Todos os membros' },
                { value: 'team', label: 'Equipes específicas' },
                { value: 'person', label: 'Servos específicos' },
              ]}
              value={formData.recipientType}
              onValueChange={value =>
                setFormData({
                  ...formData,
                  recipientType: value as 'all' | 'team' | 'person',
                  selectedIds: [],
                })
              }
              placeholder="Selecione os destinatários"
            />
          </div>

          {/* Conditional selection */}
          {formData.recipientType !== 'all' && (
            <div>
              <CheckboxList
                items={checkboxItems}
                selectedIds={formData.selectedIds}
                onToggle={toggleSelection}
              />
            </div>
          )}

          {/* Communication Type */}
          <div>
            <label
              htmlFor="sendViaEmail"
              className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2"
            >
              Tipo de Comunicação <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <Checkbox
                id="sendViaEmail"
                label="Enviar por Email"
                checked={formData.sendViaEmail}
                onChange={e => setFormData({ ...formData, sendViaEmail: e.target.checked })}
              />
              <Checkbox
                id="sendViaChat"
                label="Enviar por Chat (Grupo)"
                checked={formData.sendViaChat}
                onChange={e => setFormData({ ...formData, sendViaChat: e.target.checked })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 border border-dark-300 dark:border-dark-700 text-dark-700 dark:text-dark-300 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Enviar Mensagem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
