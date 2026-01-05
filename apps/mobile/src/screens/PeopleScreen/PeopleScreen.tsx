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
import { Person, Ministry, Team } from '@minc-hub/shared/types'
import { MOCK_PEOPLE, MOCK_MINISTRIES, MOCK_TEAMS } from '@/constants/mockData'
import { ServoCard } from './ServoCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { getMinistry, getTeam } from '@/utils/entityHelpers'
import { themeSpacing } from '@/theme'

export default function PeopleScreen() {
  const {
    items: people,
    create,
    update,
    remove,
  } = useCrud<Person>({
    initialItems: MOCK_PEOPLE,
  })
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMinistry] = useState<string>('all')
  const [filterTeam] = useState<string>('all')
  const modal = useModal()
  const deleteModal = useModal()
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
    ministryId: '',
    teamId: '',
  })

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: people,
    searchFields: ['name', 'email', 'phone'],
    searchTerm,
    customFilter: (person, term) => {
      const searchLower = term.toLowerCase()
      const matchesSearch =
        person.name.toLowerCase().includes(searchLower) ||
        (person.email?.toLowerCase().includes(searchLower) ?? false) ||
        (person.phone?.toLowerCase().includes(searchLower) ?? false)

      const matchesMinistry = filterMinistry === 'all' || person.ministryId === filterMinistry
      const matchesTeam = filterTeam === 'all' || person.teamId === filterTeam

      return matchesSearch && matchesMinistry && matchesTeam
    },
  })

  function handleOpenModal(person?: Person) {
    if (person) {
      setEditingPerson(person)
      setFormData({
        name: person.name,
        email: person.email ?? '',
        phone: person.phone ?? '',
        birthDate: person.birthDate ?? '',
        address: person.address ?? '',
        notes: person.notes ?? '',
        ministryId: person.ministryId ?? '',
        teamId: person.teamId ?? '',
      })
    } else {
      setEditingPerson(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        address: '',
        notes: '',
        ministryId: '',
        teamId: '',
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingPerson(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      notes: '',
      ministryId: '',
      teamId: '',
    })
  }

  async function handleSubmit() {
    if (editingPerson) {
      await update(editingPerson.id, formData)
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

  function renderItem({ item }: { item: Person }) {
    const ministry = getMinistry(item, ministries)
    const team = getTeam(item, teams)

    return (
      <ServoCard
        person={item}
        ministry={ministry}
        team={team}
        onEdit={() => handleOpenModal(item)}
        onDelete={() => handleDeleteClick(item.id)}
      />
    )
  }

  const hasFilters = searchTerm || filterMinistry !== 'all' || filterTeam !== 'all'
  const emptyComponent = (
    <EmptyState
      message="Nenhum servo encontrado"
      emptyMessage="Nenhum servo cadastrado"
      searchTerm={hasFilters ? searchTerm : undefined}
    />
  )

  return (
    <View style={styles.container}>
      <Header title="Servos" subtitle="Gerencie servos do Time Boas-Vindas" />
      <SearchBar
        placeholder="Buscar por nome, email ou telefone..."
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
        title={editingPerson ? 'Editar Servo' : 'Novo Servo'}
      >
        <ScrollView style={styles.form}>
          <Input
            label="Nome *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="Nome completo"
          />
          <Input
            label="Email"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Telefone"
            value={formData.phone}
            onChangeText={text => setFormData({ ...formData, phone: text })}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
          />
          <Input
            label="Data de Nascimento"
            value={formData.birthDate}
            onChangeText={text => setFormData({ ...formData, birthDate: text })}
            placeholder="DD/MM/AAAA"
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChangeText={text => setFormData({ ...formData, address: text })}
            placeholder="Endereço completo"
          />
          <Input
            label="Observações"
            value={formData.notes}
            onChangeText={text => setFormData({ ...formData, notes: text })}
            placeholder="Observações sobre o servo"
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
              title={editingPerson ? 'Salvar' : 'Criar'}
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
        message="Tem certeza que deseja excluir este servo? Esta ação não pode ser desfeita."
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
