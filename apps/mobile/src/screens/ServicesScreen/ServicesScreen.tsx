import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { Service } from '@minc-hub/shared/types'
import { MOCK_SERVICES } from '@/constants/mockData'
import { ServiceCard } from './ServiceCard'
import { useListScreen } from '@/hooks/useListScreen'

export default function ServicesScreen() {
  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [searchTerm, setSearchTerm] = useState('')

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: services,
    searchFields: ['name'],
    searchTerm,
  })

  function handleEdit(service: Service) {
    // TODO: Implementar edição
  }

  function handleDelete(id: string) {
    // TODO: Implementar deleção
  }

  function renderItem({ item }: { item: Service }) {
    return (
      <ServiceCard
        service={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  const emptyComponent = (
    <EmptyState
      message="Nenhum culto encontrado"
      emptyMessage="Nenhum culto cadastrado"
      searchTerm={searchTerm}
    />
  )

  return (
    <View style={styles.container}>
      <Header title="Cultos" subtitle="Gerencie os cultos cadastrados" />
      <SearchBar
        placeholder="Buscar por nome..."
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
