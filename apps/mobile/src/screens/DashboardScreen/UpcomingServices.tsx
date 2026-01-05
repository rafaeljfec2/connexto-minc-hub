import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Card } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

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
  if (services.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Próximas Escalas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map(service => (
          <Card key={service.id} style={styles.card}>
            <View style={styles.dateBadge}>
              <Text style={styles.dayText}>{service.day}</Text>
              <Text style={styles.monthText}>{service.month}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.serviceName} numberOfLines={1}>
                {service.name}
              </Text>
              <Text style={styles.serviceTeam} numberOfLines={1}>
                {service.team}
              </Text>
              <Text style={styles.serviceTime}>{service.time}</Text>
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
    color: themeColors.text.default,
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
    backgroundColor: themeColors.primary[50],
    padding: themeSpacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  dayText: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.primary[600],
  },
  monthText: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.primary[600],
    textTransform: 'uppercase',
  },
  info: {
    flex: 1,
  },
  serviceName: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
    marginBottom: 2,
  },
  serviceTeam: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.text.default,
    marginBottom: 4,
  },
  serviceTime: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.dark[400],
  },
})
