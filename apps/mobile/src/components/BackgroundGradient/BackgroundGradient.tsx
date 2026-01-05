import React, { type ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/contexts/ThemeContext'

interface BackgroundGradientProps {
  readonly children: ReactNode
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  const { theme } = useTheme()

  const colors =
    theme === 'light'
      ? ['#ffffff', '#fff7ed', '#fed7aa', '#ffedd5', '#ffffff']
      : ['#09090b', '#431407', '#c2410c', '#f97316', '#09090b']

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
