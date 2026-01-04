import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { PageWithCrud } from '@/components/pages/PageWithCrud'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { Schedule, Service, Team } from '@/types'
import { formatDate } from '@/lib/utils'

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    churchId: '1',
    type: 'sunday_morning' as any,
    dayOfWeek: 0,
    time: '09:00',
    name: 'Culto Dominical Manhã',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Equipe Manhã',
    ministryId: '1',
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Equipe Noite',
    ministryId: '1',
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: '1',
    serviceId: '1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    teamIds: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    serviceId: '1',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    teamIds: ['2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function SchedulesPage() {
  const { items: schedules, create, update, remove } = useCrud<Schedule>({
    initialItems: MOCK_SCHEDULES,
  })
  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const modal = useModal()
  const deleteModal = useModal()
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    teamIds: [] as string[],
  })

  function handleOpenModal(schedule?: Schedule) {
    if (schedule) {
      setEditingSchedule(schedule)
      setFormData({
        serviceId: schedule.serviceId,
        date: schedule.date.split('T')[0],
        teamIds: schedule.teamIds,
      })
    } else {
      setEditingSchedule(null)
      setFormData({
        serviceId: services[0]?.id ?? '',
        date: '',
        teamIds: [],
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingSchedule(null)
    setFormData({
      serviceId: '',
      date: '',
      teamIds: [],
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const scheduleData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    }

    if (editingSchedule) {
      update(editingSchedule.id, scheduleData)
    } else {
      create(scheduleData)
    }

    handleCloseModal()
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  function handleDeleteConfirm() {
    if (deletingId) {
      remove(deletingId)
      setDeletingId(null)
    }
  }

  function toggleTeam(teamId: string) {
    setFormData({
      ...formData,
      teamIds: formData.teamIds.includes(teamId)
        ? formData.teamIds.filter((id) => id !== teamId)
        : [...formData.teamIds, teamId],
    })
  }

  function handleAutoAssign() {
    if (!formData.serviceId || !formData.date) {
      alert('Selecione um culto e uma data primeiro')
      return
    }

    const activeTeams = teams.filter((t) => t.isActive)
    if (activeTeams.length === 0) {
      alert('Não há equipes ativas disponíveis')
      return
    }

    const randomTeam = activeTeams[Math.floor(Math.random() * activeTeams.length)]
    setFormData({
      ...formData,
      teamIds: [randomTeam.id],
    })
  }

  function getServiceName(serviceId: string) {
    return services.find((s) => s.id === serviceId)?.name ?? 'Culto não encontrado'
  }

  function getTeamNames(teamIds: string[]) {
    return teamIds
      .map((id) => teams.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  // Custom search function for schedules
  const [searchTerm, setSearchTerm] = useState('')
  
  function filterSchedules(searchTerm: string) {
    if (!searchTerm) return schedules
    const searchLower = searchTerm.toLowerCase()
    return schedules.filter((schedule) => {
      const service = services.find((s) => s.id === schedule.serviceId)
      return (
        service?.name.toLowerCase().includes(searchLower) ||
        formatDate(schedule.date).toLowerCase().includes(searchLower)
      )
    })
  }

  const filteredSchedules = filterSchedules(searchTerm)

  const columns = [
    {
      key: 'serviceId',
      label: 'Culto',
      render: (schedule: Schedule) => (
        <span className="font-medium">{getServiceName(schedule.serviceId)}</span>
      ),
    },
    {
      key: 'date',
      label: 'Data',
      render: (schedule: Schedule) => formatDate(schedule.date),
    },
    {
      key: 'teamIds',
      label: 'Equipes',
      render: (schedule: Schedule) => getTeamNames(schedule.teamIds) || '-',
    },
  ]

  const checkboxItems = teams
    .filter((t) => t.isActive)
    .map((team) => ({
      id: team.id,
      label: team.name,
    }))

  return (
    <>
      <PageWithCrud
        title="Escalas"
        description="Gerencie as escalas dos cultos e equipes"
        createButtonLabel="Nova Escala"
        items={filteredSchedules}
        searchFields={[]}
        searchPlaceholder="Buscar por culto ou data..."
        emptyMessage="Nenhuma escala cadastrada"
        emptySearchMessage="Nenhuma escala encontrada"
        searchCard={
          <div className="mb-6">
            <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
              <input
                type="text"
                placeholder="Buscar por culto ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-dark-800 border border-dark-700 text-dark-50 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-primary-400 hover:text-primary-300"
                >
                  Limpar busca
                </button>
              )}
            </div>
          </div>
        }
        tableContent={(paginatedItems) => (
          <DataTable
            data={paginatedItems}
            columns={columns}
            hasSearch={false}
            actions={(schedule) => (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(schedule)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(schedule.id)}
                >
                  Excluir
                </Button>
              </>
            )}
          />
        )}
        onCreateClick={() => handleOpenModal()}
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingSchedule ? 'Editar Escala' : 'Nova Escala'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Culto *"
            value={formData.serviceId}
            onChange={(e) =>
              setFormData({ ...formData, serviceId: e.target.value })
            }
            options={[
              { value: '', label: 'Selecione um culto' },
              ...services.map((service) => ({
                value: service.id,
                label: service.name,
              })),
            ]}
            required
          />
          <Input
            label="Data *"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            required
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-dark-300">
                Equipes *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoAssign}
              >
                Sortear Automaticamente
              </Button>
            </div>
            <CheckboxList
              items={checkboxItems}
              selectedIds={formData.teamIds}
              onToggle={toggleTeam}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingSchedule ? 'Salvar Alterações' : 'Criar Escala'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Escala"
        message="Tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
