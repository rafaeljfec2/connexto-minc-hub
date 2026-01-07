import React, { useState } from 'react'
import { Input, Select, Checkbox, MultiSelect, CrudScreen } from '@/components'
import { Team, Ministry } from '@minc-hub/shared/types'
import { MOCK_TEAMS, MOCK_MINISTRIES, MOCK_PEOPLE } from '@/constants/mockData'
import { TeamCard } from './TeamCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'

export default function TeamsScreen() {
  const {
    items: teams,
    create,
    update,
    remove,
  } = useCrud<Team>({
    initialItems: MOCK_TEAMS,
  })
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [searchTerm, setSearchTerm] = useState('')
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

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: teams,
    searchFields: ['name', 'description'],
    searchTerm,
  })

  function getMinistry(team: Team): Ministry | undefined {
    return ministries.find(m => m.id === team.ministryId)
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

  async function handleSubmit() {
    if (editingTeam) {
      await update(editingTeam.id, formData)
    } else {
      await create(formData)
    }
    handleCloseModal()
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      await remove(deletingId)
      setDeletingId(null)
    }
    deleteModal.close()
  }

  function renderItem(props: { item: Team }) {
    const { item } = props
    const ministry = getMinistry(item)

    return (
      <TeamCard
        team={item}
        ministry={ministry}
        onEdit={() => handleOpenModal(item)}
        onDelete={() => handleDeleteClick(item.id)}
      />
    )
  }

  return (
    <CrudScreen
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      emptyMessage={searchTerm ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'}
      onAddPress={() => handleOpenModal()}
      // Modal Props
      modalVisible={modal.visible}
      onCloseModal={handleCloseModal}
      modalTitle={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
      onSubmit={handleSubmit}
      onCancel={handleCloseModal}
      renderForm={() => (
        <>
          <Select
            label="Time *"
            value={formData.ministryId}
            onChange={value => setFormData({ ...formData, ministryId: value })}
            options={ministries.filter(m => m.isActive).map(m => ({ label: m.name, value: m.id }))}
            placeholder="Selecione um time"
          />
          <Input
            label="Nome *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Nome da equipe"
          />
          <Input
            label="Descrição"
            value={formData.description}
            onChangeText={text => setFormData({ ...formData, description: text })}
            placeholder="Descrição da equipe"
            multiline
            numberOfLines={3}
          />

          <MultiSelect
            label="Membros"
            values={formData.memberIds}
            onChange={values => setFormData({ ...formData, memberIds: values })}
            options={MOCK_PEOPLE.map(p => ({ label: p.name, value: p.id }))}
            placeholder="Selecione os membros"
          />

          <Checkbox
            label="Equipe Ativa"
            checked={formData.isActive}
            onChange={checked => setFormData({ ...formData, isActive: checked })}
          />
        </>
      )}
      // Delete Dialog Props
      deleteModalVisible={deleteModal.visible}
      onCloseDeleteModal={() => {
        deleteModal.close()
        setDeletingId(null)
      }}
      onConfirmDelete={handleDeleteConfirm}
      deleteMessage="Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita."
    />
  )
}
