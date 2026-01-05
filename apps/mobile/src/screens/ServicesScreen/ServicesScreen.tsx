import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { Service } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_SERVICES } from '@/constants/mockData'
import { ServiceCard } from './ServiceCard'

export default function ServicesScreen() {
  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch =
        searchTerm === '' ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [services, searchTerm])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(service: Service) {
    console.log('Edit service:', service)
  }

  function handleDelete(id: string) {
    console.log('Delete service:', id)
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

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm ? 'Nenhum culto encontrado' : 'Nenhum culto cadastrado'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Cultos" subtitle="Gerencie os cultos cadastrados" />
      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredServices}
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
