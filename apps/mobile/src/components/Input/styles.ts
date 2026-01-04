import { StyleSheet } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export const inputStyles = StyleSheet.create({
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
