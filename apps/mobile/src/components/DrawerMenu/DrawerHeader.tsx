import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface DrawerHeaderProps {
  readonly onClose: () => void
}

export function DrawerHeader({ onClose }: DrawerHeaderProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.header, { borderBottomColor: colors.card.border }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
        <Text style={[styles.closeIcon, { color: colors.text.default }]}>✕</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text.default }]}>Menu</Text>
      <View style={styles.closeButtonPlaceholder} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: themeSpacing.md,
    paddingHorizontal: themeSpacing.md,
    paddingBottom: themeSpacing.lg,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
  },
  closeButtonPlaceholder: {
    width: 32,
  },
})
