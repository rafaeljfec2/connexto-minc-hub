import React, { type ReactNode } from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { cardStyles } from './styles'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
  return <View style={[cardStyles.card, style]}>{children}</View>
}
