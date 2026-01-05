import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import type { MenuItem as MenuItemType } from './menuItems'

interface MenuItemProps {
  readonly item: MenuItemType
  readonly onPress: () => void
}

export function MenuItem({ item, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={item.iconName} size={24} color={themeColors.text.default} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={20} color={themeColors.dark[400]} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800],
  },
  menuIcon: {
    marginRight: themeSpacing.md,
    width: 24,
  },
  menuLabel: {
    flex: 1,
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.text.default,
  },
})
