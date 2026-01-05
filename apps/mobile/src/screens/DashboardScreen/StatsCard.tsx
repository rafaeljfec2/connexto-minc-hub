import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface StatsCardProps {
  title: string
  value: string | number
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '48%',
  },
  title: {
    fontSize: themeTypography.sizes.base,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.dark[400], // text-dark-400
    marginBottom: themeSpacing.xs,
  },
  value: {
    fontSize: themeTypography.sizes['3xl'],
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default, // text-dark-50
  },
})
