import React from 'react'
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
} from '@/components'
import { themeSpacing } from '@/theme'

interface CrudScreenProps<T> {
  title: string
  subtitle?: string
  searchTerm: string
  onSearchChange: (text: string) => void
  data: T[]
  renderItem: (props: { item: T }) => React.ReactElement
  keyExtractor: (item: T) => string
  refreshing: boolean
  onRefresh: () => void
  emptyMessage?: string
  onAddPress: () => void

  // Modal Props
  modalVisible: boolean
  onCloseModal: () => void
  modalTitle: string
  renderForm: () => React.ReactNode
  onSubmit: () => void
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string

  // Delete Dialog Props
  deleteModalVisible: boolean
  onCloseDeleteModal: () => void
  onConfirmDelete: () => void
  deleteTitle?: string
  deleteMessage?: string
}

export function CrudScreen<T>({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  emptyMessage = 'Nenhum item encontrado',
  onAddPress,
  modalVisible,
  onCloseModal,
  modalTitle,
  renderForm,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  deleteModalVisible,
  onCloseDeleteModal,
  onConfirmDelete,
  deleteTitle = 'Confirmar Exclusão',
  deleteMessage = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
}: CrudScreenProps<T>) {
  const emptyComponent = (
    <EmptyState message={emptyMessage} emptyMessage={emptyMessage} searchTerm={searchTerm} />
  )

  return (
    <View style={styles.container}>
      <Header title={title} subtitle={subtitle} />
      <SearchBar placeholder="Buscar..." value={searchTerm} onChangeText={onSearchChange} />
      <ListContainer
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshing={refreshing}
        onRefresh={onRefresh}
        emptyComponent={emptyComponent}
      />
      <FloatingActionButton onPress={onAddPress} />

      <Modal visible={modalVisible} onClose={onCloseModal} title={modalTitle}>
        <ScrollView style={styles.form}>
          {renderForm()}
          <View style={styles.modalActions}>
            <Button
              title={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={submitLabel}
              onPress={onSubmit}
              variant="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </Modal>

      <ConfirmDialog
        visible={deleteModalVisible}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title={deleteTitle}
        message={deleteMessage}
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
