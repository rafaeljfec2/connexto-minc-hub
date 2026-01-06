import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useTeams } from '@/hooks/useTeams'
import { useViewMode } from '@/hooks/useViewMode'
import { useChurches } from '@/hooks/useChurches'
import { useMinistries } from '@/hooks/useMinistries'
import { useChurch } from '@/contexts/ChurchContext'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Team } from '@minc-hub/shared/types'
import { TeamCard } from './teams/components/TeamCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'

export default function TeamsPage() {
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useTeams()
  const { churches } = useChurches()
  const { ministries } = useMinistries()
  const { selectedChurch } = useChurch()

  // Debug: Log data to verify it's being loaded
  useEffect(() => {
    // Debug logging removed
  }, [teams, ministries, selectedChurch, isLoading])
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
    churchId: selectedChurch?.id ?? '',
    ministryId: '',
    isActive: true,
  })

  // Filter ministries by selected church
  const filteredMinistries = useMemo(() => {
    if (!selectedChurch) {
      return []
    }
    return ministries.filter(ministry => ministry.churchId === selectedChurch.id)
  }, [ministries, selectedChurch])

  // Update churchId when selectedChurch changes
  useEffect(() => {
    if (selectedChurch) {
      setFormData(prev => ({ ...prev, churchId: selectedChurch.id }))
    }
  }, [selectedChurch])

  // Update ministryId when church changes or ministries are loaded
  useEffect(() => {
    if (filteredMinistries.length > 0) {
      const currentMinistry = filteredMinistries.find(m => m.id === formData.ministryId)
      if (!currentMinistry) {
        setFormData(prev => ({ ...prev, ministryId: filteredMinistries[0]?.id ?? '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, ministryId: '' }))
    }
  }, [filteredMinistries, formData.ministryId])

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch =
        searchTerm === '' ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [teams, searchTerm])

  function getMinistryName(ministryId: string) {
    return ministries.find(m => m.id === ministryId)?.name ?? 'Time não encontrado'
  }

  function handleOpenModal(team?: Team) {
    if (team) {
      const teamMinistry = ministries.find(m => m.id === team.ministryId)
      setEditingTeam(team)
      setFormData({
        name: team.name,
        description: team.description ?? '',
        churchId: teamMinistry?.churchId ?? '',
        ministryId: team.ministryId,
        isActive: team.isActive,
      })
    } else {
      setEditingTeam(null)
      setFormData({
        name: '',
        description: '',
        churchId: selectedChurch?.id ?? '',
        ministryId: '',
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
      churchId: selectedChurch?.id ?? '',
      ministryId: '',
      isActive: true,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      // memberIds is already removed from formData
      const { ...teamData } = formData

      // Ensure churchId is not sent to backend if it exists in teamData
      if ('churchId' in teamData) {
        delete (teamData as Record<string, unknown>).churchId
      }
      if (editingTeam) {
        await updateTeam(editingTeam.id, teamData)
      } else {
        await createTeam(teamData)
      }
      handleCloseModal()
    } catch (error) {
      // Error already handled in the hook with toast
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deleteTeam(deletingId)
        setDeletingId(null)
      } catch (error) {
        // Error already handled in the hook with toast
      }
    }
  }

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTeams.map(team => {
        if (!team?.id) return null
        return (
          <TeamCard
            key={team.id}
            team={team}
            ministryName={getMinistryName(team.ministryId)}
            onEdit={handleOpenModal}
            onDelete={handleDeleteClick}
            isUpdating={isLoading}
            isDeleting={isLoading}
          />
        )
      })}
    </div>
  )

  const listViewRows = filteredTeams
    .filter(team => team?.id)
    .map(team => (
      <TableRow key={team.id}>
        <TableCell>
          <span className="font-medium">{team.name}</span>
        </TableCell>
        <TableCell>{getMinistryName(team.ministryId)}</TableCell>
        <TableCell>{team.description ?? '-'}</TableCell>
        <TableCell>
          {team.memberIds?.length ?? 0} membro{(team.memberIds?.length ?? 0) !== 1 ? 's' : ''}
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
            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(team.id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))

  return (
    <>
      <CrudPageLayout
        title="Equipes"
        description="Gerencie equipes do Time Boas-Vindas"
        createButtonLabel="Nova Equipe"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredTeams.length === 0 && !isLoading}
        emptyTitle={hasFilters ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'}
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
            label="Igreja *"
            value={selectedChurch?.id ?? ''}
            onChange={() => {
              // Church is controlled by header selector
            }}
            options={churches.map(church => ({
              value: church.id,
              label: church.name,
            }))}
            required
            disabled
          />
          <Select
            label="Time *"
            value={formData.ministryId}
            onChange={e => setFormData({ ...formData, ministryId: e.target.value })}
            options={filteredMinistries.map(ministry => ({
              value: ministry.id,
              label: ministry.name,
            }))}
            required
            disabled={!selectedChurch || filteredMinistries.length === 0}
          />
          <Input
            label="Nome da Equipe *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição da equipe..."
            rows={4}
          />
          <Checkbox
            label="Equipe ativa"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
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
