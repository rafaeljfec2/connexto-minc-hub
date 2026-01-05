import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface StatsCardProps {
  title: string
  value: string | number
  icon: keyof typeof Ionicons.glyphMap
  trend?: string
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: `${colors.primary || '#f97316'}15` }]}
        >
          <Ionicons name={icon} size={20} color={colors.primary || '#f97316'} />
        </View>
        {trend && <Text style={[styles.trend, { color: colors.primary }]}>{trend}</Text>}
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: colors.text.default }]}>{value}</Text>
        <Text style={[styles.title, { color: colors.text.dark }]}>{title}</Text>
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
    borderRadius: 8,
  },
  content: {
    gap: 2,
  },
  title: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
  },
  value: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
  },
  trend: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
  },
})
