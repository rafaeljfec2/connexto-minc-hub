import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { Ministry, Church } from '@minc-hub/shared/types'
import { MOCK_MINISTRIES, MOCK_CHURCHES } from '@/constants/mockData'
import { MinistryCard } from './MinistryCard'
import { useListScreen } from '@/hooks/useListScreen'
import { getChurchName } from '@/utils/entityHelpers'

export default function MinistriesScreen() {
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [churches] = useState<Church[]>(MOCK_CHURCHES)
  const [searchTerm, setSearchTerm] = useState('')

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: ministries,
    searchFields: ['name', 'description'],
    searchTerm,
  })

  function handleEdit(ministry: Ministry) {
    // TODO: Implementar edição
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
  }

  function renderItem({ item }: { item: Ministry }) {
    const churchName = getChurchName(item, churches)
    return (
      <MinistryCard
        ministry={item}
        churchName={churchName}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  const emptyComponent = (
    <EmptyState
      message="Nenhum time encontrado"
      emptyMessage="Nenhum time cadastrado"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <Header title="Times" subtitle="Gerencie os times cadastrados" />
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
