import React, { useState } from 'react'
import { Input, CrudScreen } from '@/components'
import { Ministry, Church } from '@minc-hub/shared/types'
import { MOCK_MINISTRIES, MOCK_CHURCHES } from '@/constants/mockData'
import { MinistryCard } from './MinistryCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { getChurchName } from '@/utils/entityHelpers'

export default function MinistriesScreen() {
  const {
    items: ministries,
    create,
    update,
    remove,
  } = useCrud<Ministry>({
    initialItems: MOCK_MINISTRIES,
  })
  const [churches] = useState<Church[]>(MOCK_CHURCHES)
  const [searchTerm, setSearchTerm] = useState('')
  const modal = useModal()
  const deleteModal = useModal()
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    churchId: churches[0]?.id ?? '',
    isActive: true,
  })

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: ministries,
    searchFields: ['name', 'description'],
    searchTerm,
  })

  function handleOpenModal(ministry?: Ministry) {
    if (ministry) {
      setEditingMinistry(ministry)
      setFormData({
        name: ministry.name,
        description: ministry.description ?? '',
        churchId: ministry.churchId,
        isActive: ministry.isActive,
      })
    } else {
      setEditingMinistry(null)
      setFormData({
        name: '',
        description: '',
        churchId: churches[0]?.id ?? '',
        isActive: true,
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingMinistry(null)
    setFormData({
      name: '',
      description: '',
      churchId: churches[0]?.id ?? '',
      isActive: true,
    })
  }

  async function handleSubmit() {
    if (editingMinistry) {
      await update(editingMinistry.id, formData)
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

  function renderItem({ item }: { item: Ministry }) {
    const churchName = getChurchName(item, churches)
    return (
      <MinistryCard
        ministry={item}
        churchName={churchName}
        onEdit={() => handleOpenModal(item)}
        onDelete={() => handleDeleteClick(item.id)}
      />
    )
  }

  return (
    <CrudScreen
      title="Times"
      subtitle="Gerencie os times cadastrados"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      emptyMessage={searchTerm ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
      onAddPress={() => handleOpenModal()}
      // Modal Props
      modalVisible={modal.visible}
      onCloseModal={handleCloseModal}
      modalTitle={editingMinistry ? 'Editar Time' : 'Novo Time'}
      onSubmit={handleSubmit}
      onCancel={handleCloseModal}
      renderForm={() => (
        <>
          <Input
            label="Nome *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Nome do time"
          />
          <Input
            label="Descrição"
            value={formData.description}
            onChangeText={text => setFormData({ ...formData, description: text })}
            placeholder="Descrição do time"
            multiline
            numberOfLines={3}
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
      deleteMessage="Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita."
    />
  )
}

const styles = {}
