import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Input } from '../Input'
import { themeSpacing } from '@/theme'

interface SearchBarProps {
  readonly placeholder: string
  readonly value: string
  readonly onChangeText: (text: string) => void
}

export function SearchBar({ placeholder, value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Input
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        containerStyle={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeSpacing.md,
    paddingTop: themeSpacing.md,
    paddingBottom: themeSpacing.sm,
  },
  input: {
    marginBottom: 0,
  },
})
