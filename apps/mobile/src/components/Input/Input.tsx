import React from 'react'
import { TextInput, View, Text } from 'react-native'
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { themeSpacing, themeTypography } from '@/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const { colors } = useTheme()

  const inputStyle: StyleProp<TextStyle> = [
    {
      borderWidth: 1,
      borderColor: error ? '#ef4444' : colors.card.border,
      borderRadius: 8,
      paddingHorizontal: themeSpacing.md,
      paddingVertical: themeSpacing.sm,
      fontSize: themeTypography.sizes.md,
      color: colors.text.default,
      backgroundColor: colors.card.background,
      minHeight: 44,
    },
    style,
  ]

  const containerStyles = [
    {
      marginBottom: themeSpacing.md,
    },
    containerStyle,
  ]

  const labelStyles: TextStyle = {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.medium,
    color: colors.text.default, // Use dynamic text color
    marginBottom: themeSpacing.xs,
  }

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.text.dark} // Use secondary text color
        {...props}
      />
      {error && (
        <Text
          style={{
            fontSize: themeTypography.sizes.xs,
            color: '#ef4444',
            marginTop: themeSpacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}
