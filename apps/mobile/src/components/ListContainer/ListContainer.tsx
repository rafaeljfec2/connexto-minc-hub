import React, { type ReactElement } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, type ListRenderItem } from 'react-native'
import { themeSpacing } from '@/theme'

interface ListContainerProps<T> {
  readonly data: T[]
  readonly renderItem: ListRenderItem<T>
  readonly keyExtractor: (item: T, index: number) => string
  readonly refreshing: boolean
  readonly onRefresh: () => void
  readonly emptyComponent?: ReactElement
}

export function ListContainer<T extends { id: string }>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  emptyComponent,
}: ListContainerProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      ListEmptyComponent={emptyComponent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: themeSpacing.md,
    paddingTop: 0,
  },
})
