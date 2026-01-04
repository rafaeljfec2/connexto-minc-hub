import React from 'react'
import { TextInput, View, Text, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={themeColors.dark[400]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: themeSpacing.md,
  },
  label: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.text.light,
    marginBottom: themeSpacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.dark[300],
    borderRadius: 8,
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    fontSize: themeTypography.sizes.md,
    color: themeColors.text.light,
    backgroundColor: '#ffffff',
    minHeight: 44,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    fontSize: themeTypography.sizes.xs,
    color: '#ef4444',
    marginTop: themeSpacing.xs,
  },
})
