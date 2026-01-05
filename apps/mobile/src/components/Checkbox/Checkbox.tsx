import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface CheckboxProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: colors.primary },
          checked && { backgroundColor: colors.primary },
          disabled && { borderColor: colors.text.dark },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color={'#ffffff'} />}
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text.default },
            disabled && { color: colors.text.dark },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: themeSpacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: themeSpacing.sm,
  },
  label: {
    fontSize: themeTypography.sizes.md,
  },
})
