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
import { User, UserRole } from '@minc-hub/shared/types'
import { MOCK_USERS } from '@/constants/mockData'
import { UserCard } from './UserCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { getRoleLabel } from '@/utils/formatters'
import { themeSpacing } from '@/theme'

export default function UsersScreen() {
  const {
    items: users,
    create,
    update,
    remove,
  } = useCrud<User>({
    initialItems: MOCK_USERS,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const modal = useModal()
  const deleteModal = useModal()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.SERVO,
    canCheckIn: true,
  })

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: users,
    searchFields: ['name', 'email'],
    searchTerm,
    customFilter: (user, term) => {
      const searchLower = term.toLowerCase()
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        getRoleLabel(user.role).toLowerCase().includes(searchLower)
      )
    },
  })

  function handleOpenModal(user?: User) {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        canCheckIn: user.canCheckIn,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.SERVO,
        canCheckIn: true,
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: UserRole.SERVO,
      canCheckIn: true,
    })
  }

  async function handleSubmit() {
    if (editingUser) {
      await update(editingUser.id, formData)
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

  function renderItem({ item }: { item: User }) {
    return (
      <UserCard
        user={item}
        onEdit={() => handleOpenModal(item)}
        onDelete={() => handleDeleteClick(item.id)}
      />
    )
  }

  const emptyComponent = (
    <EmptyState
      message="Nenhum usuário encontrado"
      emptyMessage="Nenhum usuário cadastrado"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Buscar por nome, email ou função..."
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
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <ScrollView style={styles.form}>
          <Input
            label="Nome *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Nome completo"
          />
          <Input
            label="Email *"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!editingUser && (
            <Input
              label="Senha *"
              value={formData.password}
              onChangeText={text => setFormData({ ...formData, password: text })}
              placeholder="Senha"
              secureTextEntry
            />
          )}
          <Input
            label="Função"
            value={formData.role}
            onChangeText={text => setFormData({ ...formData, role: text as UserRole })}
            placeholder="servo, lider_de_time, etc"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={handleCloseModal}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={editingUser ? 'Salvar' : 'Criar'}
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
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
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
