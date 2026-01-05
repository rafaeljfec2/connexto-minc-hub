import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { Person, Ministry, Team } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_PEOPLE, MOCK_MINISTRIES, MOCK_TEAMS } from '@/constants/mockData'
import { ServoCard } from './ServoCard'

export default function PeopleScreen() {
  const [people] = useState<Person[]>(MOCK_PEOPLE)
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMinistry, setFilterMinistry] = useState<string>('all')
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  const availableTeams = useMemo(() => {
    if (filterMinistry === 'all') {
      return teams.filter(t => t.isActive)
    }
    return teams.filter(t => t.ministryId === filterMinistry && t.isActive)
  }, [filterMinistry, teams])

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch =
        searchTerm === '' ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMinistry = filterMinistry === 'all' || person.ministryId === filterMinistry
      const matchesTeam = filterTeam === 'all' || person.teamId === filterTeam

      return matchesSearch && matchesMinistry && matchesTeam
    })
  }, [people, searchTerm, filterMinistry, filterTeam])

  function getMinistry(person: Person): Ministry | undefined {
    return person.ministryId ? ministries.find(m => m.id === person.ministryId) : undefined
  }

  function getTeam(person: Person): Team | undefined {
    return person.teamId ? teams.find(t => t.id === person.teamId) : undefined
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(person: Person) {
    // TODO: Implementar edição
    console.log('Edit person:', person)
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
    console.log('Delete person:', id)
  }

  function renderItem({ item }: { item: Person }) {
    const ministry = getMinistry(item)
    const team = getTeam(item)

    return (
      <ServoCard
        person={item}
        ministry={ministry}
        team={team}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm || filterMinistry !== 'all' || filterTeam !== 'all'
            ? 'Nenhum servo encontrado'
            : 'Nenhum servo cadastrado'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Servos" subtitle="Gerencie servos do Time Boas-Vindas" />

      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPeople}
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
