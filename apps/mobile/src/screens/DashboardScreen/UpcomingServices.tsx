import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Card } from '@/components'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface ServiceItem {
  id: string
  date: string
  day: string
  month: string
  time: string
  name: string
  team: string
}

interface UpcomingServicesProps {
  services?: ServiceItem[]
}

export function UpcomingServices({ services = [] }: UpcomingServicesProps) {
  const { colors } = useTheme()

  if (services.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.default }]}>Próximas Escalas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map(service => (
          <Card key={service.id} style={styles.card}>
            <View style={[styles.dateBadge, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.dayText, { color: colors.primary }]}>{service.day}</Text>
              <Text style={[styles.monthText, { color: colors.primary }]}>{service.month}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.serviceName, { color: colors.text.default }]} numberOfLines={1}>
                {service.name}
              </Text>
              <Text style={[styles.serviceTeam, { color: colors.text.default }]} numberOfLines={1}>
                {service.team}
              </Text>
              <Text style={[styles.serviceTime, { color: colors.text.dark }]}>{service.time}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: themeSpacing.lg,
  },
  sectionTitle: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    marginBottom: themeSpacing.md,
    paddingHorizontal: themeSpacing.md,
  },
  scrollContent: {
    paddingHorizontal: themeSpacing.md,
    gap: themeSpacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: themeSpacing.md,
    width: 280,
    gap: themeSpacing.md,
  },
  dateBadge: {
    padding: themeSpacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  dayText: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.bold,
  },
  monthText: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
    textTransform: 'uppercase',
  },
  info: {
    flex: 1,
  },
  serviceName: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.bold,
    marginBottom: 2,
  },
  serviceTeam: {
    fontSize: themeTypography.sizes.xs,
    marginBottom: 4,
  },
  serviceTime: {
    fontSize: themeTypography.sizes.xs,
  },
})
