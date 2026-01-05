import React, { type ReactNode } from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeColors } from '@/theme/colors'
import { themeSpacing } from '@/theme'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
  const { theme, colors } = useTheme()

  const cardStyle = {
    backgroundColor: colors.card.background,
    borderRadius: 12,
    padding: themeSpacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme === 'light' ? 0.05 : 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.card.border,
  }

  return <View style={[cardStyle, style]}>{children}</View>
}
