import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { Team, Person } from '@/types'
import { formatDate } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

const MOCK_PEOPLE: Person[] = [
  { id: '1', name: 'João Silva', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Maria Santos', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Pedro Costa', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Equipe Manhã',
    description: 'Equipe responsável pelo culto da manhã',
    ministryId: '1',
    memberIds: ['1', '2'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Equipe Noite',
    description: 'Equipe responsável pelo culto da noite',
    ministryId: '1',
    memberIds: ['3'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS)
  const [people] = useState<Person[]>(MOCK_PEOPLE)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberIds: [] as string[],
    isActive: true,
  })

  const filteredTeams = teams.filter((team) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.description?.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE)
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function handleOpenModal(team?: Team) {
    if (team) {
      setEditingTeam(team)
      setFormData({
        name: team.name,
        description: team.description ?? '',
        memberIds: team.memberIds,
        isActive: team.isActive,
      })
    } else {
      setEditingTeam(null)
      setFormData({
        name: '',
        description: '',
        memberIds: [],
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingTeam(null)
    setFormData({
      name: '',
      description: '',
      memberIds: [],
      isActive: true,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (editingTeam) {
      setTeams(teams.map(t => 
        t.id === editingTeam.id 
          ? { ...t, ...formData, updatedAt: new Date().toISOString() }
          : t
      ))
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        ...formData,
        ministryId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTeams([...teams, newTeam])
    }
    
    handleCloseModal()
  }

  function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      setTeams(teams.filter(t => t.id !== id))
    }
  }

  function toggleMember(memberId: string) {
    setFormData({
      ...formData,
      memberIds: formData.memberIds.includes(memberId)
        ? formData.memberIds.filter(id => id !== memberId)
        : [...formData.memberIds, memberId],
    })
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">
            Equipes
          </h1>
          <p className="text-dark-400">
            Gerencie equipes do Time Boas-Vindas
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          Nova Equipe
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <SearchInput
            placeholder="Buscar por nome ou descrição..."
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
          <CardTitle>Lista de Equipes ({filteredTeams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeams.length === 0 ? (
            <div className="text-sm text-dark-400 text-center py-8">
              {searchTerm
                ? 'Nenhuma equipe encontrada'
                : 'Nenhuma equipe cadastrada'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.description ?? '-'}</TableCell>
                    <TableCell>
                      {team.memberIds.length} membro{team.memberIds.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          team.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {team.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(team)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(team.id)}
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
              totalItems={filteredTeams.length}
            />
          </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Equipe *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 px-4 py-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-50 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Descrição da equipe..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Membros da Equipe
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-dark-800 rounded-lg p-3">
              {people.map((person) => (
                <label
                  key={person.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-dark-800/30 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(person.id)}
                    onChange={() => toggleMember(person.id)}
                    className="rounded border-dark-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-200">{person.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-dark-700 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-dark-300 cursor-pointer">
              Equipe ativa
            </label>
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
              {editingTeam ? 'Salvar Alterações' : 'Criar Equipe'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
