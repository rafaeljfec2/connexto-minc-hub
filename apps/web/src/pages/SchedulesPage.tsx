import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { ComboBox } from '@/components/ui/ComboBox'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Schedule } from '@minc-hub/shared/types'
import { formatDate } from '@minc-hub/shared/utils'
import { ScheduleCard } from './schedules/components/ScheduleCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { useSchedules } from '@/hooks/useSchedules'
import { useServices } from '@/hooks/useServices'
import { useTeams } from '@/hooks/useTeams'
import { useMinistries } from '@/hooks/useMinistries'
import { useChurch } from '@/contexts/ChurchContext'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'

function ScheduleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}

function ScheduleRowSkeleton() {
  return (
    <>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </TableCell>
    </>
  )
}

export default function SchedulesPage() {
  const { schedules, isLoading, createSchedule, updateSchedule, deleteSchedule } = useSchedules()
  const { services } = useServices()
  const { teams } = useTeams()
  const { ministries } = useMinistries()
  const { selectedChurch } = useChurch()
  const modal = useModal()
  const deleteModal = useModal()
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'schedules-view-mode',
    defaultMode: 'list',
  })
  const getInitialFormData = () => ({
    serviceId: filteredServices[0]?.id ?? '',
    date: '',
    ministryId: '',
    teamIds: [] as string[],
  })

  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    ministryId: '',
    teamIds: [] as string[],
  })

  // Filter services and teams by selected church
  const filteredServices = useMemo(() => {
    if (!selectedChurch) return []
    return services.filter(service => service.churchId === selectedChurch.id)
  }, [services, selectedChurch])

  const filteredMinistries = useMemo(() => {
    if (!selectedChurch) return []
    return ministries.filter(ministry => ministry.isActive)
  }, [ministries, selectedChurch])

  const filteredTeams = useMemo(() => {
    if (!selectedChurch) return []
    // Filter teams by selected ministry if one is selected
    let filtered = teams.filter(team => team.isActive)
    if (formData.ministryId) {
      filtered = filtered.filter(team => team.ministryId === formData.ministryId)
    }
    return filtered
  }, [teams, selectedChurch, formData.ministryId])

  // Sort config state using custom hook
  const { sortConfig, handleSort, sortData } = useSort<Schedule>({
    defaultKey: 'date',
    defaultDirection: 'desc',
  })

  // Helper to get ministry name from teamIds (needed for sorting)
  const getMinistryNameByTeamIds = useMemo(() => {
    return (ids: string[]) => {
      if (!ids || ids.length === 0) return ''
      const firstTeam = teams.find(t => ids.includes(t.id))
      if (!firstTeam) return ''
      return ministries.find(m => m.id === firstTeam.ministryId)?.name ?? ''
    }
  }, [teams, ministries])

  const filteredSchedules = useMemo(() => {
    let result = schedules

    // 1. Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(schedule => {
        const service = filteredServices.find(s => s.id === schedule.serviceId)
        return (
          service?.name.toLowerCase().includes(searchLower) ||
          formatDate(schedule.date).toLowerCase().includes(searchLower)
        )
      })
    }

    // 2. Apply sorting using generic sortData
    // 2. Apply sorting using generic sortData
    return sortData(result, {
      service: item =>
        (filteredServices.find(s => s.id === item.serviceId)?.name ?? '').toLowerCase(),
      date: item => new Date(item.date).getTime(),
      ministry: item => getMinistryNameByTeamIds(item.teamIds ?? []).toLowerCase(),
    })
  }, [schedules, searchTerm, filteredServices, sortData, getMinistryNameByTeamIds])

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

  function getServiceName(serviceId: string) {
    return filteredServices.find(s => s.id === serviceId)?.name ?? 'Culto não encontrado'
  }

  function getTeamNames(teamIds: string[]) {
    return teamIds
      .map(id => {
        const team = teams.find(t => t.id === id)
        const ministry = ministries.find(m => m.id === team?.ministryId)
        return ministry ? `${ministry.name} - ${team?.name}` : team?.name
      })
      .filter(Boolean)
      .join(', ')
  }

  function getMinistryName(teamIds: string[]) {
    if (teamIds.length === 0) return null
    const firstTeam = filteredTeams.find(t => teamIds.includes(t.id))
    if (!firstTeam) return null
    return filteredMinistries.find(m => m.id === firstTeam.ministryId)?.name ?? null
  }

  function handleOpenModal(schedule?: Schedule) {
    if (schedule) {
      setEditingSchedule(schedule)
      // Convert date from ISO string to YYYY-MM-DD format
      const dateStr = schedule.date.includes('T')
        ? schedule.date.split('T')[0]
        : schedule.date.split(' ')[0]

      // Find the ministry from the first team's ministryId
      const firstTeam = filteredTeams.find(t => schedule.teamIds?.includes(t.id))
      setFormData({
        serviceId: schedule.serviceId,
        date: dateStr,
        ministryId: firstTeam?.ministryId ?? '',
        teamIds: schedule.teamIds ?? [],
      })
    } else {
      setEditingSchedule(null)
      setFormData({
        ...getInitialFormData(),
        serviceId: filteredServices[0]?.id ?? '',
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingSchedule(null)
    setFormData(getInitialFormData())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedChurch) {
      return
    }

    try {
      // Format date as YYYY-MM-DD (backend expects this format)
      const dateFormatted = formData.date

      const scheduleData = {
        serviceId: formData.serviceId,
        date: dateFormatted,
        teamIds: formData.teamIds,
      }

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData)
      } else {
        await createSchedule(scheduleData)
      }

      handleCloseModal()
    } catch (error) {
      // Error already handled in the hook with toast
      console.error('Error submitting schedule form:', error)
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deleteSchedule(deletingId)
        setDeletingId(null)
        deleteModal.close()
      } catch (error) {
        // Error already handled in the hook with toast
        console.error('Error deleting schedule:', error)
      }
    }
  }

  function toggleTeam(teamId: string) {
    setFormData({
      ...formData,
      teamIds: formData.teamIds.includes(teamId)
        ? formData.teamIds.filter(id => id !== teamId)
        : [...formData.teamIds, teamId],
    })
  }

  function handleAutoAssign() {
    if (!formData.serviceId || !formData.date || !formData.ministryId) {
      return
    }

    const activeTeams = filteredTeams.filter(t => t.isActive)
    if (activeTeams.length === 0) {
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
      {filteredSchedules.map(schedule => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          serviceName={getServiceName(schedule.serviceId)}
          ministryName={getMinistryName(schedule.teamIds ?? [])}
          teamNames={getTeamNames(schedule.teamIds ?? [])}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = filteredSchedules.map(schedule => {
    const ministryName = getMinistryName(schedule.teamIds ?? [])

    return (
      <TableRow key={schedule.id}>
        <TableCell>
          <span className="font-medium">{getServiceName(schedule.serviceId)}</span>
        </TableCell>
        <TableCell>{formatDate(schedule.date)}</TableCell>
        <TableCell>
          {ministryName ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              {ministryName}
            </span>
          ) : (
            <span className="text-dark-400 dark:text-dark-500">-</span>
          )}
        </TableCell>
        <TableCell>
          {schedule.teamIds && schedule.teamIds.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {schedule.teamIds.map((teamId, index) => {
                const team = teams.find(t => t.id === teamId)
                const ministry = ministries.find(m => m.id === team?.ministryId)
                const label = ministry ? `${ministry.name} - ${team?.name}` : team?.name

                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          ) : (
            <span className="text-dark-400 dark:text-dark-500">-</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(schedule)}>
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => handleDeleteClick(schedule.id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  })

  return (
    <>
      <CrudPageLayout
        title="Escalas"
        description="Gerencie as escalas dos cultos e equipes"
        createButtonLabel="Nova Escala"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredSchedules.length === 0}
        isLoading={isLoading}
        emptyTitle={hasFilters ? 'Nenhuma escala encontrada' : 'Nenhuma escala cadastrada'}
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
            isLoading={isLoading}
            skeletonCard={<ScheduleCardSkeleton />}
            skeletonRow={<ScheduleRowSkeleton />}
            gridView={gridView}
            listView={{
              headers: [
                renderHeader('service', 'Culto'),
                renderHeader('date', 'Data'),
                renderHeader('ministry', 'Time'),
                'Equipes',
                'Ações',
              ],

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
            onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
            options={[
              { value: '', label: 'Selecione um culto' },
              ...filteredServices.map(service => ({
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
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
              Time *
            </label>
            <ComboBox
              options={filteredMinistries.map(ministry => ({
                value: ministry.id,
                label: ministry.name,
              }))}
              value={formData.ministryId || null}
              onValueChange={ministryId => {
                setFormData({
                  ...formData,
                  ministryId: ministryId ?? '',
                  // Dont clear teams when ministry changes, just filter the selection dropdown
                })
              }}
              placeholder="Selecione um time"
              searchable
              searchPlaceholder="Buscar time..."
            />
          </div>
          {formData.ministryId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-dark-600 dark:text-dark-300">
                  Equipes *
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={handleAutoAssign}>
                  Sortear Automaticamente
                </Button>
              </div>
              <ComboBox
                options={filteredTeams
                  .filter(t => t.isActive)
                  .map(team => ({
                    value: team.id,
                    label: team.name,
                  }))}
                value={null} // Always null to allow selecting multiple
                onValueChange={teamId => {
                  if (teamId && !formData.teamIds.includes(teamId)) {
                    setFormData({
                      ...formData,
                      teamIds: [...formData.teamIds, teamId],
                    })
                  }
                }}
                placeholder="Selecione uma equipe"
                searchable
                searchPlaceholder="Buscar equipe..."
              />
              {formData.teamIds.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-dark-600 dark:text-dark-300">
                    Equipes selecionadas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.teamIds.map(teamId => {
                      // Find team in all teams, not just filtered ones
                      const team = teams.find(t => t.id === teamId)
                      const ministry = ministries.find(m => m.id === team?.ministryId)
                      return (
                        <div
                          key={teamId}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-lg"
                        >
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {ministry ? `${ministry.name} - ${team?.name}` : team?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleTeam(teamId)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {editingSchedule ? 'Salvar Alterações' : 'Criar Escala'}
            </Button>
          </div>
        </form>
      </Modal>

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close()
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Escala"
        message="Tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="error"
        showCancel={true}
      />
    </>
  )
}
