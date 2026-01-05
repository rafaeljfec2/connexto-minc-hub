import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface CheckboxProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.checkbox, checked && styles.checked, disabled && styles.checkboxDisabled]}
      >
        {checked && <Ionicons name="checkmark" size={16} color={themeColors.dark[100]} />}
      </View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
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
    borderColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: themeSpacing.sm,
  },
  checked: {
    backgroundColor: themeColors.primary[600],
  },
  checkboxDisabled: {
    borderColor: themeColors.dark[600],
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[100],
  },
  labelDisabled: {
    color: themeColors.dark[500],
  },
})
