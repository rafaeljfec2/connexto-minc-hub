import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing } from '@/theme'

interface FloatingActionButtonProps {
  readonly onPress: () => void
  readonly icon?: keyof typeof Ionicons.glyphMap
}

export function FloatingActionButton({
  onPress,
  icon = 'add',
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={28} color="#ffffff" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: themeSpacing.xl,
    right: themeSpacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: themeColors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
})
