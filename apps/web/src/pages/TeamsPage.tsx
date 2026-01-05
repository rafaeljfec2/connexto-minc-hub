import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Team, Person, Ministry } from '@/types'
import { TeamCard } from './teams/components/TeamCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { MOCK_PEOPLE, MOCK_MINISTRIES, MOCK_TEAMS } from '@/lib/mockData'

export default function TeamsPage() {
  const { items: teams, create, update, remove } = useCrud<Team>({
    initialItems: MOCK_TEAMS,
  })
  const [people] = useState<Person[]>(MOCK_PEOPLE)
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const modal = useModal()
  const deleteModal = useModal()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'teams-view-mode',
    defaultMode: 'list',
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ministryId: ministries[0]?.id ?? '',
    memberIds: [] as string[],
    isActive: true,
  })

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        searchTerm === '' ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [teams, searchTerm])

  function getMinistryName(ministryId: string) {
    return ministries.find((m) => m.id === ministryId)?.name ?? 'Time não encontrado'
  }

  function handleOpenModal(team?: Team) {
    if (team) {
      setEditingTeam(team)
      setFormData({
        name: team.name,
        description: team.description ?? '',
        ministryId: team.ministryId,
        memberIds: team.memberIds,
        isActive: team.isActive,
      })
    } else {
      setEditingTeam(null)
      setFormData({
        name: '',
        description: '',
        ministryId: ministries[0]?.id ?? '',
        memberIds: [],
        isActive: true,
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingTeam(null)
    setFormData({
      name: '',
      description: '',
      ministryId: ministries[0]?.id ?? '',
      memberIds: [],
      isActive: true,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingTeam) {
      update(editingTeam.id, formData)
    } else {
      create(formData)
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

  function toggleMember(memberId: string) {
    setFormData({
      ...formData,
      memberIds: formData.memberIds.includes(memberId)
        ? formData.memberIds.filter((id) => id !== memberId)
        : [...formData.memberIds, memberId],
    })
  }

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTeams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          ministryName={getMinistryName(team.ministryId)}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={false}
          isDeleting={false}
        />
      ))}
    </div>
  )

  const listViewRows = filteredTeams.map((team) => (
    <TableRow key={team.id}>
      <TableCell>
        <span className="font-medium">{team.name}</span>
      </TableCell>
      <TableCell>{getMinistryName(team.ministryId)}</TableCell>
      <TableCell>{team.description ?? '-'}</TableCell>
      <TableCell>
        {team.memberIds.length} membro{team.memberIds.length !== 1 ? 's' : ''}
      </TableCell>
      <TableCell>
        <StatusBadge status={team.isActive ? 'active' : 'inactive'}>
          {team.isActive ? 'Ativa' : 'Inativa'}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(team)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(team.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  const checkboxItems = people.map((person) => ({
    id: person.id,
    label: person.name,
  }))

  return (
    <>
      <CrudPageLayout
        title="Equipes"
        description="Gerencie equipes do Time Boas-Vindas"
        createButtonLabel="Nova Equipe"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredTeams.length === 0}
        emptyTitle={
          hasFilters ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'
        }
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar equipes'
            : 'Comece adicionando uma nova equipe'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome ou descrição..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            gridView={gridView}
            listView={{
              headers: ['Nome', 'Time', 'Descrição', 'Membros', 'Status', 'Ações'],
              rows: listViewRows,
            }}
          />
        }
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Time *"
            value={formData.ministryId}
            onChange={(e) =>
              setFormData({ ...formData, ministryId: e.target.value })
            }
            options={ministries.map((ministry) => ({
              value: ministry.id,
              label: ministry.name,
            }))}
            required
          />
          <Input
            label="Nome da Equipe *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição da equipe..."
            rows={4}
          />
          <div>
            <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
              Membros da Equipe
            </label>
            <CheckboxList
              items={checkboxItems}
              selectedIds={formData.memberIds}
              onToggle={toggleMember}
            />
          </div>
          <Checkbox
            label="Equipe ativa"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
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

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Equipe"
        message="Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
