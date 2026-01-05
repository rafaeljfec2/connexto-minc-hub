import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface DrawerHeaderProps {
  readonly onClose: () => void
}

export function DrawerHeader({ onClose }: DrawerHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Menu</Text>
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
    borderBottomColor: themeColors.dark[800],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: themeTypography.sizes.xl,
    color: themeColors.text.default,
    fontWeight: themeTypography.weights.bold,
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
  },
  closeButtonPlaceholder: {
    width: 32,
  },
})
