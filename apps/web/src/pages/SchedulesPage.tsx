import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { ComboBox } from '@/components/ui/ComboBox'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/Accordion'
import { MonthNavigator } from '@/components/ui/MonthNavigator'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlusIcon, EditIcon, TrashIcon } from '@/components/icons'
import { useModal } from '@/hooks/useModal'
import { useSchedules } from '@/hooks/useSchedules'
import { useServices } from '@/hooks/useServices'
import { useTeams } from '@/hooks/useTeams'
import { useMinistries } from '@/hooks/useMinistries'
import { useChurch } from '@/contexts/ChurchContext'
import { Schedule } from '@minc-hub/shared/types'
import { formatDate } from '@minc-hub/shared/utils'
import { getDayLabel } from '@/lib/constants'

// Helper to group schedules
interface GroupedSchedule {
  key: string
  date: Date
  serviceId: string
  serviceName: string
  serviceDay: number
  serviceTime: string
  schedules: Schedule[]
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

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

  // Basic Filter: Church
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
    let filtered = teams.filter(team => team.isActive)
    if (formData.ministryId) {
      filtered = filtered.filter(team => team.ministryId === formData.ministryId)
    }
    return filtered
  }, [teams, selectedChurch, formData.ministryId])

  const getServiceName = useCallback(
    (serviceId: string) => {
      return filteredServices.find(s => s.id === serviceId)?.name ?? 'Culto não encontrado'
    },
    [filteredServices]
  )

  // Filter Schedules by Month/Year and Search
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date)
      const matchesMonth =
        scheduleDate.getMonth() + 1 === selectedMonth && scheduleDate.getFullYear() === selectedYear

      if (!matchesMonth) return false

      if (!searchTerm) return true

      const searchLower = searchTerm.toLowerCase()
      const serviceName = getServiceName(schedule.serviceId).toLowerCase()
      const dateStr = formatDate(schedule.date).toLowerCase()

      return serviceName.includes(searchLower) || dateStr.includes(searchLower)
    })
  }, [schedules, selectedMonth, selectedYear, searchTerm, getServiceName])

  // Group Schedules
  const groupedSchedules = useMemo(() => {
    const groups = new Map<string, GroupedSchedule>()

    filteredSchedules.forEach(schedule => {
      const date = new Date(schedule.date)
      const dateKey = date.toISOString().split('T')[0]
      const key = `${dateKey}-${schedule.serviceId}`

      if (!groups.has(key)) {
        const service = filteredServices.find(s => s.id === schedule.serviceId)
        groups.set(key, {
          key,
          date,
          serviceId: schedule.serviceId,
          serviceName: service?.name ?? 'Desconhecido',
          serviceDay: service?.dayOfWeek ?? 0,
          serviceTime: service?.time ?? '',
          schedules: [],
        })
      }

      groups.get(key)?.schedules.push(schedule)
    })

    return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [filteredSchedules, filteredServices])

  // Handlers (Modal, Submit, Delete) - mostly same as before
  function handleOpenModal(schedule?: Schedule) {
    if (schedule) {
      setEditingSchedule(schedule)
      const dateStr = schedule.date.includes('T')
        ? schedule.date.split('T')[0]
        : schedule.date.split(' ')[0]
      const firstTeam = filteredTeams.find(t => schedule.teamIds?.includes(t.id))
      setFormData({
        serviceId: schedule.serviceId,
        date: dateStr,
        ministryId: firstTeam?.ministryId ?? '',
        teamIds: schedule.teamIds ?? [],
      })
    } else {
      setEditingSchedule(null)
      // Auto-set date to current month if possible
      const currentMonthStr = selectedMonth.toString().padStart(2, '0')
      const initialDate = `${selectedYear}-${currentMonthStr}-01`
      setFormData({
        ...getInitialFormData(),
        serviceId: filteredServices[0]?.id ?? '',
        date: initialDate,
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
    if (!selectedChurch) return
    try {
      // Prepare clean payload without ministryId
      const payload = {
        serviceId: formData.serviceId,
        date: formData.date,
        teamIds: formData.teamIds,
      }

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, payload)
      } else {
        await createSchedule(payload)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error submitting form:', error)
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
        console.error('Error deleting:', error)
      }
    }
  }

  function handleAutoAssign() {
    const activeTeams = filteredTeams.filter(t => t.isActive)
    if (activeTeams.length > 0) {
      const randomTeam = activeTeams[Math.floor(Math.random() * activeTeams.length)]
      setFormData(prev => ({ ...prev, teamIds: [randomTeam.id] }))
    }
  }

  function toggleTeam(teamId: string) {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId],
    }))
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Escalas"
        description="Gerencie as escalas dos cultos e equipes"
        action={
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Escala
          </Button>
        }
      />

      {/* Filters Base Container */}
      <div className="bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-800 p-4 space-y-4 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Buscar por culto ou data..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Month Filter */}
        <div className="flex justify-center border-t border-dark-100 dark:border-dark-800 pt-4">
          <MonthNavigator
            month={selectedMonth.toString().padStart(2, '0')}
            year={selectedYear.toString()}
            onChange={(m, y) => {
              setSelectedMonth(Number(m))
              setSelectedYear(Number(y))
            }}
            className="w-full max-w-sm"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : groupedSchedules.length === 0 ? (
          <div className="text-center py-12 text-dark-500 dark:text-dark-400 bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-800">
            Nenhuma escala encontrada para este período.
          </div>
        ) : (
          <Accordion className="space-y-4">
            {groupedSchedules.map(group => (
              <AccordionItem key={group.key} value={group.key}>
                <AccordionTrigger>
                  <div className="flex flex-1 items-center justify-between mr-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-dark-900 dark:text-dark-50">
                          {formatDate(group.date.toISOString())}
                        </span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
                          {getDayLabel(group.serviceDay)}
                        </span>
                      </div>
                      <span className="text-base text-dark-600 dark:text-dark-300">
                        {group.serviceName} - {group.serviceTime}
                      </span>
                    </div>
                    {/* Edit Action - Stops Propagation to allow clicking without toggling accordion */}
                    <div onClick={e => e.stopPropagation()}>
                      <Button
                        variant="action-edit"
                        size="sm"
                        onClick={() => {
                          if (group.schedules.length > 0) {
                            handleOpenModal(group.schedules[0])
                          }
                        }}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {group.schedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="flex items-start justify-between p-3 bg-white dark:bg-dark-950 rounded-lg border border-dark-200 dark:border-dark-800"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-2">
                            {schedule.teamIds && schedule.teamIds.length > 0 ? (
                              schedule.teamIds.map(teamId => {
                                const team = teams.find(t => t.id === teamId)
                                const ministry = ministries.find(m => m.id === team?.ministryId)
                                return (
                                  <span
                                    key={teamId}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  >
                                    {ministry?.name} - {team?.name}
                                  </span>
                                )
                              })
                            ) : (
                              <span className="text-dark-500 text-sm">Sem equipes</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="action-delete"
                            size="sm"
                            onClick={() => handleDeleteClick(schedule.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

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
              onValueChange={ministryId =>
                setFormData({ ...formData, ministryId: ministryId ?? '' })
              }
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
                  .map(team => ({ value: team.id, label: team.name }))}
                value={null}
                onValueChange={teamId => {
                  if (teamId && !formData.teamIds.includes(teamId)) {
                    setFormData(prev => ({ ...prev, teamIds: [...prev.teamIds, teamId] }))
                  }
                }}
                placeholder="Selecione uma equipe"
                searchable
                searchPlaceholder="Buscar equipe..."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.teamIds.map(teamId => {
                  const team = teams.find(t => t.id === teamId)
                  return (
                    <div
                      key={teamId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-lg"
                    >
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {team?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTeam(teamId)}
                        className="text-primary-600 hover:text-primary-700"
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
    </main>
  )
}
