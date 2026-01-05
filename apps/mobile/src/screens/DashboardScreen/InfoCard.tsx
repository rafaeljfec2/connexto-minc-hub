import React, { type ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface InfoCardProps {
  title: string
  children: ReactNode
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: themeColors.card.background,
    borderColor: themeColors.primary[500],
    borderWidth: 1,
  },
  title: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.md,
  },
  content: {
    marginTop: themeSpacing.xs,
  },
})
