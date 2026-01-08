import { useNavigate } from 'react-router-dom'
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
import { TeamItemCard } from './teams/components/TeamItemCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { Skeleton } from '@/components/ui/Skeleton'

import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function TeamsPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const navigate = useNavigate()
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

      const matchesMinistry =
        selectedMinistryFilter === 'all' || team.ministryId === selectedMinistryFilter

      return matchesSearch && matchesMinistry
    })
  }, [teams, searchTerm, selectedMinistryFilter])

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

  const handleTeamMenuClick = (team: Team) => {
    // Abrir menu de opções (editar/excluir)
    // Por enquanto, vamos apenas abrir o modal de edição
    handleOpenModal(team)
  }

  const handleTeamClick = (team: Team) => {
    navigate(`/teams/${team.id}`)
  }

  // Layout mobile com novo design
  const mobileListView = (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      {/* Barra de busca */}
      <div className="px-4 pt-4 pb-3 bg-white dark:bg-dark-950 flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-dark-400 dark:text-dark-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar equipe..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-lg text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros por ministério */}
      <div className="px-4 pb-3 bg-white dark:bg-dark-950 overflow-x-auto flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMinistryFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedMinistryFilter === 'all'
                ? 'bg-dark-900 dark:bg-dark-50 text-white dark:text-dark-900'
                : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300'
            }`}
          >
            Todos
          </button>
          {filteredMinistries.map(ministry => (
            <button
              key={ministry.id}
              onClick={() => setSelectedMinistryFilter(ministry.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedMinistryFilter === ministry.id
                  ? 'bg-dark-900 dark:bg-dark-50 text-white dark:text-dark-900'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300'
              }`}
            >
              {ministry.name}
            </button>
          ))}
        </div>
      </div>

      {/* Seção Minhas Equipes */}
      <div className="px-4 py-3 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Minhas Equipes</h2>
          <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Ver todas
          </button>
        </div>
      </div>

      {/* Lista de equipes - área com scroll */}
      <div className="bg-dark-50 dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}

        {!isLoading && filteredTeams.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-dark-500 dark:text-dark-400">
              {hasFilters ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'}
            </p>
          </div>
        )}

        {!isLoading && filteredTeams.length > 0 && (
          <div className="space-y-3">
            {filteredTeams.map(team => (
              <TeamItemCard
                key={team.id}
                team={team}
                ministryName={getMinistryName(team.ministryId)}
                onMenuClick={handleTeamMenuClick}
                onClick={handleTeamClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

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
            {team.memberIds?.length ?? 0} membro{(team.memberIds?.length ?? 0) !== 1 ? 's' : ''}
          </button>
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
      {/* Mobile View - Novo Layout */}
      {!isDesktop && mobileListView}

      {/* Desktop View - Layout Original */}
      <div className="hidden lg:block">
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
              isLoading={isLoading}
              skeletonCard={
                <div className="bg-white dark:bg-dark-900 rounded-lg p-6 shadow-sm border border-dark-200 dark:border-dark-800">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-100 dark:border-dark-800">
                    <div className="flex -space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              }
              skeletonRow={
                <>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </>
              }
            />
          }
        />
      </div>

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
