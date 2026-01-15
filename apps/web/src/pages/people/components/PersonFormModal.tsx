import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ComboBox } from '@/components/ui/ComboBox'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { TeamMembersSelector } from './TeamMembersSelector'
import { UserIcon } from '@/components/icons'
import { Person, Ministry, Team, Service, MemberType } from '@minc-hub/shared/types'
import { formatPhone } from '@/utils/phone-mask'

interface PersonFormModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly person: Person | null
  readonly ministries: Ministry[]
  readonly teams: Team[]
  readonly services: Service[]
  readonly isLoading: boolean
  readonly onSubmit: (data: Record<string, unknown>) => Promise<unknown>
  readonly onSaveAndCreateUser: (data: Record<string, unknown>) => Promise<void>
}

// Initial form state helper
const getInitialFormData = () => ({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  address: '',
  notes: '',
  ministryId: '',
  teamId: '',
  teamMembers: [] as Array<{ teamId: string; memberType: MemberType }>,
  preferredServiceIds: [] as string[],
})

export function PersonFormModal({
  isOpen,
  onClose,
  person,
  ministries,
  teams,
  services,
  isLoading,
  onSubmit,
  onSaveAndCreateUser,
}: PersonFormModalProps) {
  const [personFormData, setPersonFormData] = useState(getInitialFormData())
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (person) {
      // Extract preferred service IDs from person (assuming it's stored in notes or a custom field)
      // For now, we'll initialize as empty array
      const preferredServiceIds: string[] = []

      // Convert teamMembers to form format
      const teamMembers =
        person.teamMembers?.map(tm => ({
          teamId: tm.teamId,
          memberType: tm.memberType,
        })) ?? []

      // If person has teamId but no teamMembers, add it as fixed for compatibility
      if (person.teamId && teamMembers.length === 0) {
        teamMembers.push({
          teamId: person.teamId,
          memberType: MemberType.FIXED,
        })
      }

      setPersonFormData({
        name: person.name,
        email: person.email ?? '',
        phone: person.phone ? formatPhone(person.phone) : '',
        birthDate: person.birthDate ?? '',
        address: person.address ?? '',
        notes: person.notes ?? '',
        ministryId: person.ministryId ?? '',
        teamId: person.teamId ?? '',
        teamMembers,
        preferredServiceIds,
      })
      setEmailError('')
    } else {
      setPersonFormData(getInitialFormData())
      setEmailError('')
    }
  }, [person, isOpen])

  // Filter ministries by isActive
  const filteredMinistries = ministries.filter(m => m.isActive)

  // Filter active services
  const activeServices = services.filter(s => s.isActive)

  function handlePersonMinistryChange(ministryId: string) {
    setPersonFormData({
      ...personFormData,
      ministryId,
      teamId: '',
    })
  }

  function handleTogglePreferredService(serviceId: string) {
    setPersonFormData(prev => {
      const currentIds = prev.preferredServiceIds
      const newIds = currentIds.includes(serviceId)
        ? currentIds.filter(id => id !== serviceId)
        : [...currentIds, serviceId]
      return { ...prev, preferredServiceIds: newIds }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Prepare data logic handled by parent or similar to original page logic
    // But specific form state is here

    // We pass the raw form data up, parent handles cleaning/logic
    await onSubmit(personFormData as unknown as Record<string, unknown>)
  }

  async function handleSaveAndCreateUser() {
    // Validar se tem email antes de criar usuário
    if (!personFormData.email || !personFormData.email.trim()) {
      setEmailError('Email é obrigatório para criar um usuário')
      return
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(personFormData.email.trim())) {
      setEmailError('Email inválido')
      return
    }

    setEmailError('')
    await onSaveAndCreateUser(personFormData as unknown as Record<string, unknown>)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={person ? 'Editar Servo' : 'Novo Servo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
            Informações Básicas
          </h3>
          <Input
            label="Nome *"
            value={personFormData.name}
            onChange={e => setPersonFormData({ ...personFormData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={personFormData.email}
              onChange={e => {
                setPersonFormData({ ...personFormData, email: e.target.value })
                setEmailError('')
              }}
              placeholder="email@exemplo.com"
              error={emailError}
            />
            <Input
              label="Telefone"
              value={personFormData.phone}
              onChange={e => {
                const formatted = formatPhone(e.target.value)
                setPersonFormData({ ...personFormData, phone: formatted })
              }}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Data de Nascimento"
              type="date"
              value={personFormData.birthDate}
              onChange={e => setPersonFormData({ ...personFormData, birthDate: e.target.value })}
            />
            <Input
              label="Endereço"
              value={personFormData.address}
              onChange={e => setPersonFormData({ ...personFormData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Ministry and Teams Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
            Time e Equipes
          </h3>
          <ComboBox
            label="Time"
            value={personFormData.ministryId || null}
            onValueChange={val => handlePersonMinistryChange(val || '')}
            options={filteredMinistries.map(m => ({ value: m.id, label: m.name }))}
            placeholder="Selecione um time"
            searchable
            searchPlaceholder="Buscar time..."
          />
          <div className="bg-dark-50 dark:bg-dark-900/30 p-4 rounded-lg border border-dark-200 dark:border-dark-700">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
              Equipes
            </label>
            <TeamMembersSelector
              teams={teams}
              ministries={ministries}
              selectedMinistryId={personFormData.ministryId || undefined}
              value={personFormData.teamMembers}
              onChange={teamMembers => setPersonFormData({ ...personFormData, teamMembers })}
            />
          </div>
        </div>

        {/* Service Preferences Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
            Preferências de Cultos
          </h3>
          <div className="space-y-2">
            <p className="text-xs text-dark-600 dark:text-dark-400">
              Selecione os cultos em que este servo prefere servir
            </p>
            {activeServices.length > 0 ? (
              <CheckboxList
                items={activeServices.map(service => ({
                  id: service.id,
                  label: `${service.name} (${service.time})`,
                }))}
                selectedIds={personFormData.preferredServiceIds}
                onToggle={handleTogglePreferredService}
                maxHeight="max-h-40"
              />
            ) : (
              <p className="text-sm text-dark-500 dark:text-dark-400 py-2 text-center">
                Nenhum culto ativo disponível
              </p>
            )}
          </div>
        </div>

        {/* Additional Notes Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
            Observações
          </h3>
          <Textarea
            label="Notas adicionais"
            value={personFormData.notes}
            onChange={e => setPersonFormData({ ...personFormData, notes: e.target.value })}
            placeholder="Observações sobre o servo..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            Cancelar
          </Button>
          {!person && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAndCreateUser}
              className="w-full sm:w-auto flex items-center justify-center gap-2 order-2"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Salvar e Criar Usuário</span>
              <span className="sm:hidden">Criar Usuário</span>
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto order-1 sm:order-3"
            disabled={isLoading}
          >
            {person ? 'Salvar Alterações' : 'Adicionar Voluntário'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
