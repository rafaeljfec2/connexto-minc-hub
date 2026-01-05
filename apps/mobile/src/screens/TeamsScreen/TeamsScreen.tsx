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
import { Team, Ministry } from '@minc-hub/shared/types'
import { MOCK_TEAMS, MOCK_MINISTRIES } from '@/constants/mockData'
import { TeamCard } from './TeamCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { themeSpacing } from '@/theme'

export default function TeamsScreen() {
  const { items: teams, create, update, remove } = useCrud<Team>({
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

  function renderItem({ item }: { item: Team }) {
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

  const emptyComponent = (
    <EmptyState
      message="Nenhuma equipe encontrada"
      emptyMessage="Nenhuma equipe cadastrada"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <Header title="Equipes" subtitle="Gerencie equipes dos times" />
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
        title={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
      >
        <ScrollView style={styles.form}>
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
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={handleCloseModal}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={editingTeam ? 'Salvar' : 'Criar'}
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
        message="Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita."
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
