import { StyleSheet } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sizeSm: {
    paddingHorizontal: themeSpacing.sm,
    paddingVertical: themeSpacing.xs,
    minHeight: 32,
  },
  sizeMd: {
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    minHeight: 44,
  },
  sizeLg: {
    paddingHorizontal: themeSpacing.lg,
    paddingVertical: themeSpacing.md,
    minHeight: 52,
  },
  variantPrimary: {
    backgroundColor: themeColors.primary[600],
  },
  variantSecondary: {
    backgroundColor: themeColors.dark[200],
  },
  variantOutline: {
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
  textSizeSm: {
    fontSize: themeTypography.sizes.sm,
  },
  textSizeMd: {
    fontSize: themeTypography.sizes.md,
  },
  textSizeLg: {
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
