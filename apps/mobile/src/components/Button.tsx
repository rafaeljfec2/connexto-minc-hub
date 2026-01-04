import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

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

  const buttonStyle = [
    styles.base,
    styles[size],
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    isDisabled && styles.disabled,
    style,
  ]

  const textStyle = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'outline' && styles.textOutline,
    isDisabled && styles.textDisabled,
  ]

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#ffffff' : themeColors.primary[600]}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingHorizontal: themeSpacing.sm,
    paddingVertical: themeSpacing.xs,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: themeSpacing.lg,
    paddingVertical: themeSpacing.md,
    minHeight: 52,
  },
  primary: {
    backgroundColor: themeColors.primary[600],
  },
  secondary: {
    backgroundColor: themeColors.dark[200],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColors.primary[600],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: themeTypography.weights.semibold,
  },
  textSm: {
    fontSize: themeTypography.sizes.sm,
  },
  textMd: {
    fontSize: themeTypography.sizes.md,
  },
  textLg: {
    fontSize: themeTypography.sizes.lg,
  },
  textPrimary: {
    color: '#ffffff',
  },
  textSecondary: {
    color: themeColors.dark[900],
  },
  textOutline: {
    color: themeColors.primary[600],
  },
  textDisabled: {
    opacity: 0.6,
  },
})
