import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageWithCrud } from '@/components/pages/PageWithCrud'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { Team, Person, Ministry } from '@/types'

const MOCK_PEOPLE: Person[] = [
  { id: '1', name: 'João Silva', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Maria Santos', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Pedro Costa', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const MOCK_MINISTRIES: Ministry[] = [
  {
    id: '1',
    name: 'Time Boas-Vindas',
    churchId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  const { items: teams, create, update, remove } = useCrud<Team>({
    initialItems: MOCK_TEAMS,
  })
  const [people] = useState<Person[]>(MOCK_PEOPLE)
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const modal = useModal()
  const deleteModal = useModal()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ministryId: ministries[0]?.id ?? '',
    memberIds: [] as string[],
    isActive: true,
  })

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

  function getMinistryName(ministryId: string) {
    return ministries.find((m) => m.id === ministryId)?.name ?? 'Time não encontrado'
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
        ? formData.memberIds.filter(id => id !== memberId)
        : [...formData.memberIds, memberId],
    })
  }

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (team: Team) => <span className="font-medium">{team.name}</span>,
    },
    {
      key: 'ministryId',
      label: 'Time',
      render: (team: Team) => getMinistryName(team.ministryId),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (team: Team) => team.description ?? '-',
    },
    {
      key: 'memberIds',
      label: 'Membros',
      render: (team: Team) => `${team.memberIds.length} membro${team.memberIds.length !== 1 ? 's' : ''}`,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (team: Team) => (
        <StatusBadge status={team.isActive ? 'active' : 'inactive'}>
          {team.isActive ? 'Ativa' : 'Inativa'}
        </StatusBadge>
      ),
    },
  ]

  const checkboxItems = people.map((person) => ({
    id: person.id,
    label: person.name,
  }))

  return (
    <>
      <PageWithCrud
        title="Equipes"
        description="Gerencie equipes do Time Boas-Vindas"
        createButtonLabel="Nova Equipe"
        items={teams}
        searchFields={['name', 'description']}
        searchPlaceholder="Buscar por nome ou descrição..."
        emptyMessage="Nenhuma equipe cadastrada"
        emptySearchMessage="Nenhuma equipe encontrada"
        tableContent={(paginatedItems) => (
          <DataTable
            data={paginatedItems}
            columns={columns}
            hasSearch={false}
            actions={(team) => (
              <>
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
                  onClick={() => handleDeleteClick(team.id)}
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
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição da equipe..."
            rows={4}
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
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
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
