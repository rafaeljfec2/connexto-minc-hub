import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import type { ViewStyle } from 'react-native'
import { themeColors } from '@/theme'
import { getButtonStyles, getButtonTextStyles } from './getButtonStyles'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  const buttonStyle = getButtonStyles({ variant, size, isDisabled, style })
  const textStyle = getButtonTextStyles(variant, size, isDisabled)
  const activityIndicatorColor = variant === 'primary' ? '#ffffff' : themeColors.primary[600]

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={activityIndicatorColor} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
