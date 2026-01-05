import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { Team, Ministry } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_TEAMS, MOCK_MINISTRIES } from '@/constants/mockData'
import { TeamCard } from './TeamCard'

export default function TeamsScreen() {
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch =
        searchTerm === '' ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [teams, searchTerm])

  function getMinistry(team: Team): Ministry | undefined {
    return ministries.find(m => m.id === team.ministryId)
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(team: Team) {
    console.log('Edit team:', team)
  }

  function handleDelete(id: string) {
    console.log('Delete team:', id)
  }

  function renderItem({ item }: { item: Team }) {
    const ministry = getMinistry(item)

    return (
      <TeamCard
        team={item}
        ministry={ministry}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Equipes" subtitle="Gerencie equipes dos times" />

      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredTeams}
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
    backgroundColor: themeColors.background.default,
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
