import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { User } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_USERS } from '@/constants/mockData'
import { UserCard } from './UserCard'

function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: 'Admin',
    COORDINATOR: 'Coordenador',
    LEADER: 'Líder',
    MEMBER: 'Membro',
  }
  return roleMap[role] ?? role
}

export default function UsersScreen() {
  const [users] = useState<User[]>(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [users, searchTerm])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(user: User) {
    console.log('Edit user:', user)
  }

  function handleDelete(id: string) {
    console.log('Delete user:', id)
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

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Usuários" subtitle="Gerencie os usuários do sistema" />
      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nome, email ou função..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  filters: {
    paddingHorizontal: themeSpacing.md,
    paddingBottom: themeSpacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  list: {
    padding: themeSpacing.md,
    paddingTop: 0,
  },
  empty: {
    padding: themeSpacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
    textAlign: 'center',
  },
})
