import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { Ministry, Church } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_MINISTRIES, MOCK_CHURCHES } from '@/constants/mockData'
import { MinistryCard } from './MinistryCard'

export default function MinistriesScreen() {
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES)
  const [churches] = useState<Church[]>(MOCK_CHURCHES)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredMinistries = useMemo(() => {
    return ministries.filter(ministry => {
      const matchesSearch =
        searchTerm === '' ||
        ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ministry.description?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [ministries, searchTerm])

  function getChurchName(ministry: Ministry): string | undefined {
    return churches.find(c => c.id === ministry.churchId)?.name
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(ministry: Ministry) {
    console.log('Edit ministry:', ministry)
  }

  function handleDelete(id: string) {
    console.log('Delete ministry:', id)
  }

  function renderItem({ item }: { item: Ministry }) {
    const churchName = getChurchName(item)
    return (
      <MinistryCard
        ministry={item}
        churchName={churchName}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Times" subtitle="Gerencie os times cadastrados" />
      <View style={styles.filters}>
        <Input
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredMinistries}
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
