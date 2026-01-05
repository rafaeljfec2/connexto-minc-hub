import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
  Header,
  SearchBar,
  ListContainer,
  EmptyState,
  Modal,
  ConfirmDialog,
  FloatingActionButton,
  Button,
  Input,
} from '@/components'
import { Ministry, Church } from '@minc-hub/shared/types'
import { MOCK_MINISTRIES, MOCK_CHURCHES } from '@/constants/mockData'
import { MinistryCard } from './MinistryCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { getChurchName } from '@/utils/entityHelpers'
import { themeSpacing } from '@/theme'

export default function MinistriesScreen() {
  const { items: ministries, create, update, remove } = useCrud<Ministry>({
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

  const emptyComponent = (
    <EmptyState
      message="Nenhum time encontrado"
      emptyMessage="Nenhum time cadastrado"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <Header title="Times" subtitle="Gerencie os times cadastrados" />
      <SearchBar
        placeholder="Buscar por nome ou descrição..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <ListContainer
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyComponent={emptyComponent}
      />
      <FloatingActionButton onPress={() => handleOpenModal()} />

      <Modal
        visible={modal.visible}
        onClose={handleCloseModal}
        title={editingMinistry ? 'Editar Time' : 'Novo Time'}
      >
        <ScrollView style={styles.form}>
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
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={handleCloseModal}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={editingMinistry ? 'Salvar' : 'Criar'}
              onPress={handleSubmit}
              variant="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </Modal>

      <ConfirmDialog
        visible={deleteModal.visible}
        onClose={() => {
          deleteModal.close()
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  form: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: themeSpacing.sm,
    marginTop: themeSpacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
})
