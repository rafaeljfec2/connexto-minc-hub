import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
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

const ITEMS_PER_PAGE = 10

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES)
  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    teamIds: [] as string[],
  })

  const filteredSchedules = schedules.filter((schedule) => {
    if (!searchTerm) return true
    const service = services.find((s) => s.id === schedule.serviceId)
    const searchLower = searchTerm.toLowerCase()
    return (
      service?.name.toLowerCase().includes(searchLower) ||
      formatDate(schedule.date).toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE)
  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingSchedule(null)
    setFormData({
      serviceId: '',
      date: '',
      teamIds: [],
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingSchedule) {
      setSchedules(
        schedules.map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                ...formData,
                date: new Date(formData.date).toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      )
    } else {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        ...formData,
        date: new Date(formData.date).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setSchedules([...schedules, newSchedule])
    }

    handleCloseModal()
  }

  function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta escala?')) {
      setSchedules(schedules.filter((s) => s.id !== id))
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

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">Escalas</h1>
          <p className="text-dark-400">
            Gerencie as escalas dos cultos e equipes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={handleAutoAssign}>
            Sorteio Automático
          </Button>
          <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
            Nova Escala
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <SearchInput
            placeholder="Buscar por culto ou data..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            onClear={() => {
              setSearchTerm('')
              setCurrentPage(1)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Escalas ({filteredSchedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSchedules.length === 0 ? (
            <div className="text-sm text-dark-400 text-center py-8">
              {searchTerm
                ? 'Nenhuma escala encontrada'
                : 'Nenhuma escala cadastrada'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Culto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Equipes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {getServiceName(schedule.serviceId)}
                      </TableCell>
                      <TableCell>{formatDate(schedule.date)}</TableCell>
                      <TableCell>
                        {getTeamNames(schedule.teamIds) || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
                            onClick={() => handleDelete(schedule.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredSchedules.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSchedule ? 'Editar Escala' : 'Nova Escala'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Culto *
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) =>
                setFormData({ ...formData, serviceId: e.target.value })
              }
              className="w-full h-11 px-4 rounded-lg bg-dark-900 border border-dark-700 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecione um culto</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
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
            <div className="space-y-2 max-h-48 overflow-y-auto border border-dark-800 rounded-lg p-3">
              {teams
                .filter((t) => t.isActive)
                .map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-dark-800/30 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.teamIds.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="rounded border-dark-700 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-200">{team.name}</span>
                  </label>
                ))}
            </div>
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
    </main>
  )
}
