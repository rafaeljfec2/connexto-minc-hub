import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { Church } from '@minc-hub/shared/types'
import { MOCK_CHURCHES } from '@/constants/mockData'
import { ChurchCard } from './ChurchCard'
import { useListScreen } from '@/hooks/useListScreen'

export default function ChurchesScreen() {
  const [churches] = useState<Church[]>(MOCK_CHURCHES)
  const [searchTerm, setSearchTerm] = useState('')

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: churches,
    searchFields: ['name', 'address', 'email', 'phone'],
    searchTerm,
  })

  function handleEdit(church: Church) {
    // TODO: Implementar edição
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
  }

  function renderItem({ item }: { item: Church }) {
    return (
      <ChurchCard
        church={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  const emptyComponent = (
    <EmptyState
      message="Nenhuma igreja encontrada"
      emptyMessage="Nenhuma igreja cadastrada"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <Header title="Igrejas" subtitle="Gerencie as igrejas cadastradas no sistema" />
      <SearchBar
        placeholder="Buscar por nome, endereço, email ou telefone..."
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
