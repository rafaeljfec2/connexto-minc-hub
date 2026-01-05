import React, { useState, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { Person, Ministry, Team } from '@minc-hub/shared/types'
import { MOCK_PEOPLE, MOCK_MINISTRIES, MOCK_TEAMS } from '@/constants/mockData'
import { ServoCard } from './ServoCard'
import { useListScreen } from '@/hooks/useListScreen'
import { getMinistry, getTeam } from '@/utils/entityHelpers'

export default function PeopleScreen() {
  const [people] = useState<Person[]>(MOCK_PEOPLE)
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMinistry, setFilterMinistry] = useState<string>('all')
  const [filterTeam, setFilterTeam] = useState<string>('all')

  const availableTeams = useMemo(() => {
    if (filterMinistry === 'all') {
      return teams.filter(t => t.isActive)
    }
    return teams.filter(t => t.ministryId === filterMinistry && t.isActive)
  }, [filterMinistry, teams])

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

  function handleEdit(person: Person) {
    // TODO: Implementar edição
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
  }

  function renderItem({ item }: { item: Person }) {
    const ministry = getMinistry(item, ministries)
    const team = getTeam(item, teams)

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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
