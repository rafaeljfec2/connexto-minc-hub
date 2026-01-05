import { StyleSheet } from 'react-native'
import { themeColors, themeSpacing } from '@/theme'

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: themeColors.card.background,
    borderRadius: 8,
    padding: themeSpacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: themeColors.card.border,
  },
})
