import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface StatsCardProps {
  title: string
  value: string | number
  icon: keyof typeof Ionicons.glyphMap
  trend?: string
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={themeColors.primary[500]} />
        </View>
        {trend && <Text style={styles.trend}>{trend}</Text>}
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    padding: themeSpacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: themeSpacing.sm,
  },
  iconContainer: {
    padding: themeSpacing.xs,
    backgroundColor: themeColors.primary[50] + '80', // Transparent primary
    borderRadius: 8,
  },
  content: {
    gap: 2,
  },
  title: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.dark[400],
  },
  value: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
  },
  trend: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.primary[500],
    fontWeight: themeTypography.weights.medium,
  },
})
