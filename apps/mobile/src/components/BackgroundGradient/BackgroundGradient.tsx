import React, { type ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { themeColors } from '@/theme'

interface BackgroundGradientProps {
  readonly children: ReactNode
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#09090b', '#431407', '#c2410c', '#f97316', '#09090b']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.6)', // dark-950/60
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
})
