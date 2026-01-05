import React, { useState } from 'react'
import { Input, Select, CrudScreen } from '@/components'
import { Person, Ministry, Team } from '@minc-hub/shared/types'
import { MOCK_PEOPLE, MOCK_MINISTRIES, MOCK_TEAMS } from '@/constants/mockData'
import { ServoCard } from './ServoCard'
import { useListScreen } from '@/hooks/useListScreen'
import { useCrud } from '@/hooks/useCrud'
import { useModal } from '@/hooks/useModal'
import { getMinistry, getTeam } from '@/utils/entityHelpers'

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
  return (
    <CrudScreen
      title="Servos"
      subtitle="Gerencie servos do Time Boas-Vindas"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      emptyMessage={hasFilters ? 'Nenhum servo encontrado' : 'Nenhum servo cadastrado'}
      onAddPress={() => handleOpenModal()}
      // Modal Props
      modalVisible={modal.visible}
      onCloseModal={handleCloseModal}
      modalTitle={editingPerson ? 'Editar Servo' : 'Novo Servo'}
      onSubmit={handleSubmit}
      onCancel={handleCloseModal}
      renderForm={() => (
        <>
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

          <Select
            label="Time"
            value={formData.ministryId}
            onChange={value => setFormData({ ...formData, ministryId: value, teamId: '' })}
            options={ministries.filter(m => m.isActive).map(m => ({ label: m.name, value: m.id }))}
            placeholder="Selecione um time"
          />

          <Select
            label="Equipe"
            value={formData.teamId}
            onChange={value => setFormData({ ...formData, teamId: value })}
            options={teams
              .filter(t => t.ministryId === formData.ministryId && t.isActive)
              .map(t => ({ label: t.name, value: t.id }))}
            placeholder="Selecione uma equipe"
            disabled={!formData.ministryId}
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
        </>
      )}
      // Delete Dialog Props
      deleteModalVisible={deleteModal.visible}
      onCloseDeleteModal={() => {
        deleteModal.close()
        setDeletingId(null)
      }}
      onConfirmDelete={handleDeleteConfirm}
      deleteMessage="Tem certeza que deseja excluir este servo? Esta ação não pode ser desfeita."
    />
  )
}

const styles = {}
