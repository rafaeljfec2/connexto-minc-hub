import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface EmptyStateProps {
  readonly message: string
  readonly searchTerm?: string
  readonly emptyMessage?: string
}

export function EmptyState({ message, searchTerm, emptyMessage }: EmptyStateProps) {
  const displayMessage = searchTerm ? message : emptyMessage ?? message

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{displayMessage}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: themeSpacing.xl,
    alignItems: 'center',
  },
  text: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
    textAlign: 'center',
  },
})
