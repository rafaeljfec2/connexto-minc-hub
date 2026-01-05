import { StyleSheet } from 'react-native'
import { themeColors, themeSpacing } from '@/theme'

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)', // dark-900/80 (80% opacidade)
    borderRadius: 12, // rounded-xl (12px)
    padding: themeSpacing.md, // p-4 (16px)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // shadow mais suave
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: themeColors.dark[800], // dark-800
  },
})
