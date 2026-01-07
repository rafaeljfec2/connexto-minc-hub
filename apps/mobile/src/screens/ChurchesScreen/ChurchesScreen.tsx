import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
  SearchBar,
  ListContainer,
  EmptyState,
  Modal,
  ConfirmDialog,
  FloatingActionButton,
  Button,
  Input,
} from '@/components'
import { Church } from '@minc-hub/shared/types'
import { MOCK_CHURCHES } from '@/constants/mockData'
import { ChurchCard } from './ChurchCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { themeSpacing } from '@/theme'

export default function ChurchesScreen() {
  const {
    items: churches,
    create,
    update,
    remove,
  } = useCrud<Church>({
    initialItems: MOCK_CHURCHES,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const modal = useModal()
  const deleteModal = useModal()
  const [editingChurch, setEditingChurch] = useState<Church | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: churches,
    searchFields: ['name', 'address', 'email', 'phone'],
    searchTerm,
  })

  function handleOpenModal(church?: Church) {
    if (church) {
      setEditingChurch(church)
      setFormData({
        name: church.name,
        address: church.address ?? '',
        phone: church.phone ?? '',
        email: church.email ?? '',
      })
    } else {
      setEditingChurch(null)
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingChurch(null)
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
    })
  }

  async function handleSubmit() {
    if (editingChurch) {
      await update(editingChurch.id, formData)
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

  function renderItem({ item }: { item: Church }) {
    return (
      <ChurchCard
        church={item}
        onEdit={() => handleOpenModal(item)}
        onDelete={() => handleDeleteClick(item.id)}
      />
    )
  }

  const emptyComponent = (
    <EmptyState
      message="Nenhuma igreja encontrada"
      emptyMessage="Nenhuma igreja cadastrada"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Buscar por nome, endereço, email ou telefone..."
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
        title={editingChurch ? 'Editar Igreja' : 'Nova Igreja'}
      >
        <ScrollView style={styles.form}>
          <Input
            label="Nome *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Nome da igreja"
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChangeText={text => setFormData({ ...formData, address: text })}
            placeholder="Endereço completo"
          />
          <Input
            label="Telefone"
            value={formData.phone}
            onChangeText={text => setFormData({ ...formData, phone: text })}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
          />
          <Input
            label="Email"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={handleCloseModal}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={editingChurch ? 'Salvar' : 'Criar'}
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
        message="Tem certeza que deseja excluir esta igreja? Esta ação não pode ser desfeita."
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
