import React, { type ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/contexts/ThemeContext'

interface BackgroundGradientProps {
  readonly children: ReactNode
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  const { theme } = useTheme()

  /*
   * NEW DESIGN - Improved UX - V2 (Softer)
   * Top: Very subtle brand hint (Dark Orange/Brown)
   * Body: clean dark background.
   */
  const colors =
    theme === 'light'
      ? (['#fff7ed', '#ffffff', '#ffffff'] as const)
      : (['#431407', '#09090b', '#09090b'] as const) // Darker start color (#431407 is orange-950 approx)

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.35, 1]} // Gradient covers top 35%, then solid
      start={{ x: 0.5, y: 0 }} // Top Center
      end={{ x: 0.5, y: 1 }} // Bottom Center
      style={styles.container}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
