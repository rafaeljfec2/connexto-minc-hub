import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { User } from '@minc-hub/shared/types'
import { MOCK_USERS } from '@/constants/mockData'
import { UserCard } from './UserCard'
import { useListScreen } from '@/hooks/useListScreen'
import { getRoleLabel } from '@/utils/formatters'

export default function UsersScreen() {
  const [users] = useState<User[]>(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState('')

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

  function handleEdit(user: User) {
    // TODO: Implementar edição
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
  }

  function renderItem({ item }: { item: User }) {
    return (
      <UserCard
        user={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
      <Header title="Usuários" subtitle="Gerencie os usuários do sistema" />
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
