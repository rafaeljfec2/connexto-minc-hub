import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { Church } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_CHURCHES } from '@/constants/mockData'
import { ChurchCard } from './ChurchCard'

export default function ChurchesScreen() {
  const [churches] = useState<Church[]>(MOCK_CHURCHES)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredChurches = useMemo(() => {
    return churches.filter(church => {
      const matchesSearch =
        searchTerm === '' ||
        church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [churches, searchTerm])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(church: Church) {
    console.log('Edit church:', church)
  }

  function handleDelete(id: string) {
    console.log('Delete church:', id)
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

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm ? 'Nenhuma igreja encontrada' : 'Nenhuma igreja cadastrada'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Igrejas" subtitle="Gerencie as igrejas cadastradas no sistema" />
      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nome, endereço, email ou telefone..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredChurches}
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
