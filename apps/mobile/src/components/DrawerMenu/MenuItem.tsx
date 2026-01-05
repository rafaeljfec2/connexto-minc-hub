import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeSpacing, themeTypography } from '@/theme'
import type { MenuItem as MenuItemType } from './menuItems'
import { useTheme } from '@/contexts/ThemeContext'

interface MenuItemProps {
  readonly item: MenuItemType
  readonly onPress: () => void
}

export function MenuItem({ item, onPress }: MenuItemProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.card.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.iconName}
        size={24}
        color={colors.text.default}
        style={styles.menuIcon}
      />
      <Text style={[styles.menuLabel, { color: colors.text.default }]}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.text.dark} />
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
  },
  menuIcon: {
    marginRight: themeSpacing.md,
    width: 24,
  },
  menuLabel: {
    flex: 1,
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.medium,
  },
})
