import React, { type ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface BackgroundGradientProps {
  readonly children: ReactNode
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  return (
    <LinearGradient
      colors={['#09090b', '#431407', '#c2410c', '#f97316', '#09090b']}
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
