import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Schedule, Service, Team } from '@/types'
import { formatDate } from '@/lib/utils'
import { ScheduleCard } from './schedules/components/ScheduleCard'
import { EditIcon, TrashIcon } from '@/components/icons'

function PlusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  )
}

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
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'schedules-view-mode',
  })
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    teamIds: [] as string[],
  })

  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules
    const searchLower = searchTerm.toLowerCase()
    return schedules.filter((schedule) => {
      const service = services.find((s) => s.id === schedule.serviceId)
      return (
        service?.name.toLowerCase().includes(searchLower) ||
        formatDate(schedule.date).toLowerCase().includes(searchLower)
      )
    })
  }, [schedules, searchTerm, services])

  function getServiceName(serviceId: string) {
    return services.find((s) => s.id === serviceId)?.name ?? 'Culto não encontrado'
  }

  function getTeamNames(teamIds: string[]) {
    return teamIds
      .map((id) => teams.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

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

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredSchedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          serviceName={getServiceName(schedule.serviceId)}
          teamNames={getTeamNames(schedule.teamIds)}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={false}
          isDeleting={false}
        />
      ))}
    </div>
  )

  const listViewRows = filteredSchedules.map((schedule) => (
    <TableRow key={schedule.id}>
      <TableCell>
        <span className="font-medium">{getServiceName(schedule.serviceId)}</span>
      </TableCell>
      <TableCell>{formatDate(schedule.date)}</TableCell>
      <TableCell>{getTeamNames(schedule.teamIds) || '-'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(schedule)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(schedule.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  const checkboxItems = teams
    .filter((t) => t.isActive)
    .map((team) => ({
      id: team.id,
      label: team.name,
    }))

  return (
    <>
      <CrudPageLayout
        title="Escalas"
        description="Gerencie as escalas dos cultos e equipes"
        createButtonLabel="Nova Escala"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredSchedules.length === 0}
        emptyTitle={
          hasFilters ? 'Nenhuma escala encontrada' : 'Nenhuma escala cadastrada'
        }
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar escalas'
            : 'Comece adicionando uma nova escala'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por culto ou data..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            gridView={gridView}
            listView={{
              headers: ['Culto', 'Data', 'Equipes', 'Ações'],
              rows: listViewRows,
            }}
          />
        }
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
              <label className="block text-sm font-medium text-dark-600 dark:text-dark-300">
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
