import { StyleSheet } from 'react-native'
import { themeColors, themeSpacing } from '@/theme'

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: themeSpacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: themeColors.dark[200],
  },
})
