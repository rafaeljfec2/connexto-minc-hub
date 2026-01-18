import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useModal } from '@/hooks/useModal'
import { useTeams } from '@/hooks/useTeams'
import { useViewMode } from '@/hooks/useViewMode'
import { useChurches } from '@/hooks/useChurches'
import { useMinistries } from '@/hooks/useMinistries'
import { useChurch } from '@/contexts/ChurchContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { EditIcon, TrashIcon } from '@/components/icons'
import type { Team } from '@minc-hub/shared/types'
import { TeamCard } from './teams/components/TeamCard'
import { TeamsMobileView } from './teams/components/TeamsMobileView'
import { TeamsDesktopView } from './teams/components/TeamsDesktopView'
import { TeamFormModal } from './teams/components/TeamFormModal'

export default function TeamsPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const navigate = useNavigate()
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useTeams()
  const { churches } = useChurches()
  const { ministries } = useMinistries()
  const { selectedChurch } = useChurch()

  const modal = useModal()
  const deleteModal = useModal()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMinistryFilter, setSelectedMinistryFilter] = useState<string>('all')
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

  const { sortConfig, handleSort, sortData } = useSort<Team>({
    defaultKey: 'name',
    defaultDirection: 'asc',
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

  const getMinistryName = useCallback(
    (ministryId: string) => {
      return ministries.find(m => m.id === ministryId)?.name ?? 'Time não encontrado'
    },
    [ministries]
  )

  const filteredTeams = useMemo(() => {
    const result = teams.filter(team => {
      const matchesSearch =
        searchTerm === '' ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMinistry =
        selectedMinistryFilter === 'all' || team.ministryId === selectedMinistryFilter

      return matchesSearch && matchesMinistry
    })

    // Sort with natural sort for name field to handle numbers correctly
    const sorted = sortData(result, {
      name: item => {
        // Extract numbers and pad them for natural sorting
        const name = item.name.toLowerCase()
        return name.replace(/\d+/g, match => match.padStart(10, '0'))
      },
      ministry: item => getMinistryName(item.ministryId).toLowerCase(),
      description: item => (item.description || '').toLowerCase(),
      members: item => item.memberIds?.length ?? 0,
      status: item => (item.isActive ? 1 : 0),
    })

    return sorted
  }, [teams, searchTerm, selectedMinistryFilter, sortData, getMinistryName])

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

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
      const { ...teamData } = formData

      // Ensure churchId is not sent to backend
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
      console.error(error)
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
        console.error(error)
        // Error already handled in the hook with toast
      }
    }
  }

  const hasFilters = searchTerm !== '' || selectedMinistryFilter !== 'all'

  const handleTeamEdit = (team: Team) => {
    handleOpenModal(team)
  }

  const handleTeamDelete = (team: Team) => {
    handleDeleteClick(team.id)
  }

  const handleTeamClick = (team: Team) => {
    navigate(`/teams/${team.id}`)
  }

  // Grid view for desktop
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
            onClick={handleTeamClick}
            isUpdating={isLoading}
            isDeleting={isLoading}
          />
        )
      })}
    </div>
  )

  // List view rows for desktop
  const listViewRows = filteredTeams
    .filter(team => team?.id)
    .map(team => (
      <TableRow key={team.id}>
        <TableCell>
          <button
            type="button"
            className="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors block text-left w-full"
            onClick={() => handleTeamClick(team)}
          >
            {team.name}
          </button>
        </TableCell>
        <TableCell>{getMinistryName(team.ministryId)}</TableCell>
        <TableCell>{team.description ?? '-'}</TableCell>
        <TableCell>
          <button
            type="button"
            className="cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors block text-left w-full"
            onClick={() => handleTeamClick(team)}
          >
            {team.memberIds?.length ?? 0} membro{(team.memberIds?.length ?? 0) === 1 ? '' : 's'}
          </button>
        </TableCell>
        <TableCell>
          <StatusBadge status={team.isActive ? 'active' : 'inactive'}>
            {team.isActive ? 'Ativa' : 'Inativa'}
          </StatusBadge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="action-edit" size="sm" onClick={() => handleOpenModal(team)}>
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => handleDeleteClick(team.id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))

  const listViewHeaders = [
    renderHeader('name', 'Nome'),
    renderHeader('ministry', 'Time'),
    renderHeader('description', 'Descrição'),
    renderHeader('members', 'Membros'),
    renderHeader('status', 'Status'),
    'Ações',
  ]

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <TeamsMobileView
          teams={filteredTeams}
          ministries={filteredMinistries}
          isLoading={isLoading}
          searchTerm={searchTerm}
          selectedMinistryFilter={selectedMinistryFilter}
          hasFilters={hasFilters}
          onSearchChange={setSearchTerm}
          onMinistryFilterChange={setSelectedMinistryFilter}
          getMinistryName={getMinistryName}
          onTeamEdit={handleTeamEdit}
          onTeamDelete={handleTeamDelete}
          onTeamClick={handleTeamClick}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      {/* Desktop View */}
      <TeamsDesktopView
        teams={filteredTeams}
        isLoading={isLoading}
        hasFilters={hasFilters}
        searchTerm={searchTerm}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onViewModeChange={setViewMode}
        onCreateClick={() => handleOpenModal()}
        gridView={gridView}
        listViewHeaders={listViewHeaders}
        listViewRows={listViewRows}
      />

      {/* Team Form Modal */}
      <TeamFormModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingTeam={editingTeam}
        formData={formData}
        onFormDataChange={setFormData}
        churches={churches}
        ministries={filteredMinistries}
        selectedChurch={selectedChurch}
      />

      {/* Delete Confirmation Alert */}
      <Alert
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Equipe"
        message="Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="error"
        showCancel={true}
      />
    </>
  )
}
