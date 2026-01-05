import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { themeColors, getThemeColors } from '@/theme'
import { themeSpacing, themeTypography } from '@/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
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
  const { colors } = useTheme()
  const isDisabled = disabled || isLoading

  const sizeStyles = {
    sm: { paddingHorizontal: themeSpacing.sm, paddingVertical: themeSpacing.xs, minHeight: 32 },
    md: { paddingHorizontal: themeSpacing.md, paddingVertical: themeSpacing.sm, minHeight: 44 },
    lg: { paddingHorizontal: themeSpacing.lg, paddingVertical: themeSpacing.md, minHeight: 52 },
  }[size]

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.card.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
  }[variant]

  const textStyles: TextStyle = {
    fontWeight: themeTypography.weights.semibold,
    fontSize: {
      sm: themeTypography.sizes.sm,
      md: themeTypography.sizes.md,
      lg: themeTypography.sizes.lg,
    }[size],
    color: {
      primary: '#ffffff',
      secondary: colors.text.default,
      outline: colors.primary,
    }[variant],
  }

  const buttonStyle: ViewStyle = {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: isDisabled ? 0.5 : 1,
    ...sizeStyles,
    ...variantStyles,
  }

  const activityIndicatorColor = variant === 'primary' ? '#ffffff' : colors.primary

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={activityIndicatorColor} size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
