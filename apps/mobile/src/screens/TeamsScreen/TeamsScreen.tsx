import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { Team, Ministry } from '@minc-hub/shared/types'
import { MOCK_TEAMS, MOCK_MINISTRIES } from '@/constants/mockData'
import { TeamCard } from './TeamCard'
import { useListScreen } from '@/hooks/useListScreen'

export default function TeamsScreen() {
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [searchTerm, setSearchTerm] = useState('')

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: teams,
    searchFields: ['name', 'description'],
    searchTerm,
  })

  function getMinistry(team: Team): Ministry | undefined {
    return ministries.find(m => m.id === team.ministryId)
  }

  function handleEdit(team: Team) {
    // TODO: Implementar edição
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
