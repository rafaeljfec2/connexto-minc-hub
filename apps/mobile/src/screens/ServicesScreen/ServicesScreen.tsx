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
import { Service, ServiceType } from '@minc-hub/shared/types'
import { MOCK_SERVICES } from '@/constants/mockData'
import { ServiceCard } from './ServiceCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { themeSpacing } from '@/theme'

export default function ServicesScreen() {
  const {
    items: services,
    create,
    update,
    remove,
  } = useCrud<Service>({
    initialItems: MOCK_SERVICES,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const modal = useModal()
  const deleteModal = useModal()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: '0',
    time: '09:00',
    isActive: true,
  })

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: services,
    searchFields: ['name'],
    searchTerm,
  })

  const handleOpenModal = React.useCallback(
    (service?: Service) => {
      if (service) {
        setEditingService(service)
        setFormData({
          name: service.name,
          type: service.type,
          dayOfWeek: service.dayOfWeek.toString(),
          time: service.time,
          isActive: service.isActive,
        })
      } else {
        setEditingService(null)
        setFormData({
          name: '',
          type: ServiceType.SUNDAY_MORNING,
          dayOfWeek: '0',
          time: '09:00',
          isActive: true,
        })
      }
      modal.open()
    },
    [modal]
  )

  function handleCloseModal() {
    modal.close()
    setEditingService(null)
    setFormData({
      name: '',
      type: ServiceType.SUNDAY_MORNING,
      dayOfWeek: '0',
      time: '09:00',
      isActive: true,
    })
  }

  async function handleSubmit() {
    const submitData = {
      ...formData,
      dayOfWeek: Number.parseInt(formData.dayOfWeek, 10),
      churchId: '1', // Default church
    }
    if (editingService) {
      await update(editingService.id, submitData)
    } else {
      await create(submitData)
    }
    handleCloseModal()
  }

  const handleDeleteClick = React.useCallback(
    (id: string) => {
      setDeletingId(id)
      deleteModal.open()
    },
    [deleteModal]
  )

  async function handleDeleteConfirm() {
    if (deletingId) {
      await remove(deletingId)
      setDeletingId(null)
    }
    deleteModal.close()
  }

  const renderItem = React.useCallback(
    (props: { item: Service }) => {
      const { item } = props
      return (
        <ServiceCard
          service={item}
          onEdit={() => handleOpenModal(item)}
          onDelete={() => handleDeleteClick(item.id)}
        />
      )
    },
    [handleOpenModal, handleDeleteClick]
  )

  const emptyComponent = (
    <EmptyState
      message="Nenhum culto encontrado"
      emptyMessage="Nenhum culto cadastrado"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <SearchBar placeholder="Buscar por nome..." value={searchTerm} onChangeText={setSearchTerm} />
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
        title={editingService ? 'Editar Culto' : 'Novo Culto'}
      >
        <ScrollView style={styles.form}>
          <Input
            label="Nome *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Nome do culto"
          />
          <Input
            label="Tipo"
            value={formData.type}
            onChangeText={text => setFormData({ ...formData, type: text as ServiceType })}
            placeholder="sunday_morning, sunday_evening, etc"
          />
          <Input
            label="Dia da Semana (0-6)"
            value={formData.dayOfWeek}
            onChangeText={text => setFormData({ ...formData, dayOfWeek: text })}
            placeholder="0 = Domingo"
            keyboardType="numeric"
          />
          <Input
            label="Horário"
            value={formData.time}
            onChangeText={text => setFormData({ ...formData, time: text })}
            placeholder="09:00"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={handleCloseModal}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={editingService ? 'Salvar' : 'Criar'}
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
        message="Tem certeza que deseja excluir este culto? Esta ação não pode ser desfeita."
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
