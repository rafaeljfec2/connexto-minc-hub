import React, { type ReactNode } from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { themeColors, themeSpacing } from '@/theme'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: themeSpacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: themeColors.dark[200],
  },
})
